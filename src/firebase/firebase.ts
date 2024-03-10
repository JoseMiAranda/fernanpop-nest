import * as admin from 'firebase-admin'
import * as serviceAccount from "credentials.json";

export default admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Creamos un nuevo campo en el request
declare global {
    namespace Express {
        interface Request {
            firebaseUser: admin.auth.DecodedIdToken
        }
    }
}