import { firebaseFetch } from "@/app/services/firebaseApi";

const API_HOST = "10.52.40.12";
const API_PORT = "5000";

export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;
export const FIREBASE_API_BASE_URL = "firebase://cashier";

const nativeFetch = globalThis.fetch.bind(globalThis);

if (!(globalThis as any).__cashierFirebaseFetchInstalled) {
    (globalThis as any).__cashierFirebaseFetchInstalled = true;
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
            typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.toString()
                  : input.url;

        if (url.startsWith(FIREBASE_API_BASE_URL)) {
            return firebaseFetch(url, init) as unknown as Promise<Response>;
        }

        return nativeFetch(input, init);
    }) as typeof fetch;
}

export const apiUrl = (path: string) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${FIREBASE_API_BASE_URL}${normalizedPath}`;
};
