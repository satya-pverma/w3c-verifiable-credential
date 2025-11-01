// pages/api/vc/sign.js
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
import * as vc from '@digitalbazaar/vc';
import jsonldSignatures from 'jsonld-signatures';

const { purposes } = jsonldSignatures;

// === CACHED CONTEXTS ===
const CACHED_CONTEXTS = {
  "https://www.w3.org/ns/credentials/v2": {
    "@context": {
      "@vocab": "https://www.w3.org/2018/credentials#",
      "id": "@id",
      "type": "@type",
      "sec": "https://w3id.org/security#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "VerifiableCredential": "sec:VerifiableCredential",
      "credentialSubject": "sec:credentialSubject",
      "issuer": "sec:issuer",
      "issuanceDate": { "@id": "sec:issuanceDate", "@type": "xsd:dateTime" },
      "credentialSchema": "sec:credentialSchema",
      "proof": { "@id": "sec:proof", "@type": "@id", "@container": "@graph" }
    }
  },
  "https://w3id.org/security/suites/ed25519-2020/v1": {
    "@context": {
      "id": "@id",
      "type": "@type",
      "Ed25519VerificationKey2020": "sec:Ed25519VerificationKey2020",
      "Ed25519Signature2020": "sec:Ed25519Signature2020",
      "verificationMethod": "sec:verificationMethod",
      "proof": { "@id": "sec:proof", "@type": "@id", "@container": "@graph" },
      "proofValue": "sec:proofValue",
      "proofPurpose": "sec:proofPurpose",
      "assertionMethod": "sec:assertionMethod"
    }
  }
};

// === Global Key Pair (In-memory for demo – use secure storage in prod) ===
let keyPair = null;
let keyDoc = null;
let didDoc = null;

async function getKeyPair(issuerName) {
  if (!keyPair) {
    console.log("Generating key pair for did:nuvowallet:medos...");
    keyPair = await Ed25519VerificationKey2020.generate({
      controller: `did:nuvowallet:${issuerName}`
    });

    // CRITICAL: Set key ID to match verificationMethod
    keyPair.id = `${keyPair.controller}#${keyPair.publicKeyMultibase}`;

    keyDoc = await keyPair.export({ publicKey: true });
    keyDoc.publicKeyMultibase = keyPair.publicKeyMultibase; // Ensure it's there

    didDoc = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/ed25519-2020/v1"
      ],
      id: keyPair.controller,
      verificationMethod: [keyDoc],
      assertionMethod: [keyDoc.id],
      authentication: [keyDoc.id]
    };
  }
  return keyPair;
}

const documentLoader = async (url) => {
  if (CACHED_CONTEXTS[url]) {
    return { contextUrl: undefined, documentUrl: url, document: CACHED_CONTEXTS[url] };
  }
  if (didDoc && url === didDoc.id) return { document: didDoc };
  if (keyDoc && url === keyDoc.id) return { document: keyDoc };
  throw new Error(`Unsupported URL: ${url}`);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { unsignedVC } = req.body;

  if (!unsignedVC || typeof unsignedVC !== 'object') {
    return res.status(400).json({ error: 'Invalid or missing unsignedVC in body' });
  }

  try {
    const keyPair = await getKeyPair(unsignedVC?.issuer?.name);

    // Override issuer if not set
    if (!unsignedVC.issuer) {
      unsignedVC.issuer = { id: keyPair.controller, name: unsignedVC.issuer.name };
    }

    unsignedVC.issuer={...unsignedVC.issuer, id:  keyPair.controller }

    const suite = new Ed25519Signature2020({ key: keyPair });

    const signedVC = await vc.issue({
      credential: unsignedVC,
      suite,
      documentLoader,
      purpose: new purposes.AssertionProofPurpose()
    });

    return res.status(200).json({ data: {signedVC}, stat: true, memo: 'credential signed successfully', trxn: '', srvc:'' });
  } catch (error) {
    console.error('Sign error:', error);
    return res.status(500).json({ data: false, stat: false, memo: `Failed to sign VC ${error.message}`, trxn: '', srvc:'' } );
  }
}

// Optional: Disable body parser if needed (not required for JSON)
export const config = {
  api: {
    bodyParser: true,
  },
};