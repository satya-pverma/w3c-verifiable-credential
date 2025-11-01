// pages/api/vc/verify.js
import * as vc from '@digitalbazaar/vc';
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';
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

// === Extract DID & Key from Proof ===
function extractDidAndKey(signedVC) {
  const proof = signedVC.proof;
  if (!proof || !proof.verificationMethod) {
    throw new Error("Missing proof or verificationMethod");
  }

  const vm = proof.verificationMethod;
  const controller = vm.split('#')[0];
  const publicKeyMultibase = vm.split('#')[1]; // e.g., z6Mk...

  if (!publicKeyMultibase) {
    throw new Error("Invalid verificationMethod format");
  }

  const keyDoc = {
    id: vm,
    type: "Ed25519VerificationKey2020",
    controller,
    publicKeyMultibase
  };

  const didDoc = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1"
    ],
    id: controller,
    verificationMethod: [keyDoc],
    assertionMethod: [vm],
    authentication: [vm]
  };

  return { didDoc, keyDoc };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { signedVC } = req.body;

  if (!signedVC || typeof signedVC !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid signedVC in request body' });
  }

  try {
    const { didDoc, keyDoc } = extractDidAndKey(signedVC);

    const documentLoader = async (url) => {
      if (CACHED_CONTEXTS[url]) {
        return { contextUrl: undefined, documentUrl: url, document: CACHED_CONTEXTS[url] };
      }
      if (url === didDoc.id) return { document: didDoc };
      if (url === keyDoc.id) return { document: keyDoc };
      throw new Error(`Unsupported URL: ${url}`);
    };

    const result = await vc.verifyCredential({
      credential: signedVC,
      suite: new Ed25519Signature2020(),
      documentLoader,
      purpose: new purposes.AssertionProofPurpose()
    });

    if (result.verified) {
      const cs = signedVC.credentialSubject;
      return res.status(200).json({
        data:{
        verified: true,
        issuer: signedVC.issuer,  //?.name || signedVC.issuer?.id || "Unknown",
        holder: signedVC.credentialSubject,
        issued: signedVC.issuanceDate
        },
        stat: true,
        memo: "credential verified, no tempered in data.",
        trxn:'',
        srvc:''
      });
    } else {
      return res.status(400).json({
        data:{verified: false},
        stat: false,
        memo: result.error?.message || "Invalid signature",
        trxn:'',
        srvc:''
      });
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
    data:{verified: false},
    stat: false,
    memo: `Verification failed ${ error.message}`,
    trxn:'',
    srvc:''
    });
  }
}

// Enable body parsing
export const config = {
  api: {
    bodyParser: true,
  },
};