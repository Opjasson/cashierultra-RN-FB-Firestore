import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth, db } from "./firebaseConfig";

type JsonBody = Record<string, any>;

class FirebaseApiResponse {
    ok: boolean;
    status: number;

    constructor(
        private payload: any,
        status = 200,
    ) {
        this.status = status;
        this.ok = status >= 200 && status < 300;
    }

    async json() {
        return this.payload;
    }
}

const COLLECTIONS = {
    products: "products",
    users: "users",
    logins: "logins",
    transaksi: "transaksi",
    cart: "keranjang",
    counters: "counters",
};

const jsonResponse = (payload: any, status = 200) =>
    new FirebaseApiResponse(payload, status);

const getAuthErrorMessage = (error: any) => {
    switch (error?.code) {
        case "auth/email-already-in-use":
            return "Email sudah terpakai!";
        case "auth/invalid-email":
            return "Format email tidak valid.";
        case "auth/weak-password":
            return "Password minimal 6 karakter.";
        case "auth/operation-not-allowed":
            return "Provider Email/Password belum aktif di Firebase Auth.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Email atau password salah!";
        default:
            return error?.message ?? "Proses autentikasi gagal.";
    }
};

const getBody = async (init?: RequestInit): Promise<JsonBody> => {
    if (!init?.body) return {};
    if (typeof init.body === "string") return JSON.parse(init.body);
    return {};
};

const nowIso = () => new Date().toISOString();

const randomToken = (length = 10) => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
};

const createUuid = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};

const nextId = async (name: string) => {
    const counterRef = doc(db, COLLECTIONS.counters, name);

    return runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        const current = counterSnap.exists()
            ? Number(counterSnap.data().value ?? 0)
            : 0;
        const value = current + 1;

        transaction.set(counterRef, { value }, { merge: true });
        return value;
    });
};

const serializeDate = (value: any) => {
    if (!value) return nowIso();
    if (typeof value === "string") return value;
    if (typeof value.toDate === "function") return value.toDate().toISOString();
    return value;
};

const normalizeDoc = (snap: any) => {
    const data = snap.data();

    return {
        ...data,
        id: Number(data.id ?? snap.id),
        createdAt: serializeDate(data.createdAt),
        updatedAt: serializeDate(data.updatedAt ?? data.createdAt),
    };
};

const findDocByNumericId = async (collectionName: string, id: number) => {
    const ref = collection(db, collectionName);
    const result = await getDocs(query(ref, where("id", "==", id), limit(1)));
    return result.docs[0] ?? null;
};

const findUserByEmail = async (email: string) => {
    const result = await getDocs(
        query(
            collection(db, COLLECTIONS.users),
            where("email", "==", email),
            limit(1),
        ),
    );
    return result.docs[0] ?? null;
};

const getProducts = async () => {
    const result = await getDocs(collection(db, COLLECTIONS.products));
    return result.docs
        .map(normalizeDoc)
        .sort((a, b) => Number(a.id) - Number(b.id));
};

const getUsers = async () => {
    const result = await getDocs(collection(db, COLLECTIONS.users));
    return result.docs
        .map(normalizeDoc)
        .map(({ password, ...user }) => user)
        .sort((a, b) => Number(a.id) - Number(b.id));
};

const getLogins = async () => {
    const result = await getDocs(
        query(collection(db, COLLECTIONS.logins), orderBy("createdAt", "desc")),
    );
    return result.docs.map(normalizeDoc);
};

const getCarts = async () => {
    const result = await getDocs(collection(db, COLLECTIONS.cart));
    const products = await getProducts();
    const productMap = new Map(
        products.map((product) => [product.id, product]),
    );

    return result.docs.map((snap) => {
        const cart = normalizeDoc(snap);
        return {
            ...cart,
            product: productMap.get(cart.productId) ?? null,
        };
    });
};

const getTransactionCarts = async (transaksiId: number) => {
    const allCarts = await getCarts();
    return allCarts
        .filter((cart) => Number(cart.transaksiId) === Number(transaksiId))
        .sort((a, b) => Number(a.id) - Number(b.id));
};

const normalizeTransaksi = async (snap: any) => {
    const transaksi = normalizeDoc(snap);
    return {
        totalHarga: 0,
        buktiBayar: null,
        catatanTambahan: null,
        status: null,
        cash: null,
        ...transaksi,
        keranjangs: await getTransactionCarts(transaksi.id),
    };
};

const getTransactions = async () => {
    const result = await getDocs(collection(db, COLLECTIONS.transaksi));
    const transaksi = await Promise.all(result.docs.map(normalizeTransaksi));
    return transaksi.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

const handleLogin = async (method: string, paths: string[], body: JsonBody) => {
    if (method === "GET" && paths.length === 1) {
        return jsonResponse(await getLogins());
    }

    if (method === "POST" && paths.length === 1) {
        try {
            await signInWithEmailAndPassword(
                auth,
                String(body.email ?? ""),
                String(body.password ?? ""),
            );
        } catch (error) {
            return jsonResponse({ message: getAuthErrorMessage(error) }, 401);
        }

        const userSnap = await findUserByEmail(body.email);

        if (!userSnap) {
            return jsonResponse(
                { message: "Data akun tidak ditemukan." },
                401,
            );
        }

        const user = normalizeDoc(userSnap);

        const id = await nextId(COLLECTIONS.logins);
        await addDoc(collection(db, COLLECTIONS.logins), {
            id,
            userId: user.id,
            token: randomToken(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return jsonResponse(
            {
                message: "Login succesfully",
                response: user,
            },
            201,
        );
    }

    if (method === "DELETE" && paths.length === 2) {
        const loginSnap = await findDocByNumericId(
            COLLECTIONS.logins,
            Number(paths[1]),
        );

        if (!loginSnap) {
            await signOut(auth);
            return jsonResponse({ msg: "Data tidak ditemukan!" }, 404);
        }

        await deleteDoc(loginSnap.ref);
        await signOut(auth);
        return jsonResponse({ msg: "Data berhasil dihapus!" });
    }

    return null;
};

const handleUsers = async (method: string, paths: string[], body: JsonBody) => {
    if (method === "GET" && paths.length === 1) {
        return jsonResponse({
            msg: "get data succesfully",
            data: await getUsers(),
        });
    }

    if (method === "POST" && paths.length === 1) {
        const existingUser = await findUserByEmail(body.email);

        if (existingUser) {
            return jsonResponse({ msg: "Email sudah terpakai!" }, 400);
        }

        if (body.password !== body.confPassword) {
            return jsonResponse(
                { msg: "Password dan Confirm Password tidak cocok" },
                400,
            );
        }

        const id = await nextId(COLLECTIONS.users);
        let credential;

        try {
            credential = await createUserWithEmailAndPassword(
                auth,
                String(body.email),
                String(body.password),
            );
        } catch (error) {
            return jsonResponse({ msg: getAuthErrorMessage(error) }, 400);
        }

        await addDoc(collection(db, COLLECTIONS.users), {
            id,
            uid: credential.user.uid,
            email: body.email,
            username: body.username,
            role: body.role ?? "user",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        if (body.logoutAfterRegister) {
            await signOut(auth);
        }

        return jsonResponse({ msg: "Register berhasil" }, 201);
    }

    if (paths.length === 2) {
        const userSnap = await findDocByNumericId(
            COLLECTIONS.users,
            Number(paths[1]),
        );

        if (!userSnap)
            return jsonResponse({ msg: "Data tidak tersedia!" }, 404);

        if (method === "GET") {
            return jsonResponse(normalizeDoc(userSnap));
        }

        if (method === "PATCH") {
            if (body.password !== body.confPassword) {
                return jsonResponse(
                    { msg: "Password dan Confirm Password tidak cocok" },
                    400,
                );
            }

            await updateDoc(userSnap.ref, {
                email: body.email,
                username: body.username,
                role: body.role,
                password: body.password,
                updatedAt: serverTimestamp(),
            });

            return jsonResponse({ msg: "Akun berhasil dirubah" }, 201);
        }

        if (method === "DELETE") {
            await deleteDoc(userSnap.ref);
            return jsonResponse({ msg: "Akun berhasil dihapus!" });
        }
    }

    return null;
};

const handleForgotPassword = async (method: string, body: JsonBody) => {
    if (method !== "POST") return null;

    // const userSnap = await findUserByEmail(body.email);
    try {
        await sendPasswordResetEmail(auth, String(body.email ?? ""));
        return jsonResponse(
            { message: "Email ganti password telah dikirim" },
            201,
        );
    } catch {
        return jsonResponse({ message: "Email yang anda masukan salah" }, 401);
    }
};

const handleProducts = async (
    method: string,
    paths: string[],
    body: JsonBody,
) => {
    if (method === "GET" && paths.length === 1) {
        return jsonResponse(await getProducts());
    }

    if (method === "POST" && paths.length === 1) {
        const id = await nextId(COLLECTIONS.products);
        await addDoc(collection(db, COLLECTIONS.products), {
            id,
            nama_product: body.nama_product,
            deskripsi: body.deskripsi,
            harga_product: Number(body.harga_product ?? 0),
            img_product: body.img_product,
            kategori_product: body.kategori_product,
            promo: body.promo,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return jsonResponse({ msg: "product berhasil ditambahkan!" });
    }

    if (paths.length === 2) {
        const productSnap = await findDocByNumericId(
            COLLECTIONS.products,
            Number(paths[1]),
        );

        if (!productSnap)
            return jsonResponse({ msg: "Data tidak tersedia!" }, 404);

        if (method === "GET") return jsonResponse(normalizeDoc(productSnap));

        if (method === "PATCH") {
            const current = normalizeDoc(productSnap);
            await updateDoc(productSnap.ref, {
                nama_product: body.nama_product,
                deskripsi: body.deskripsi,
                harga_product: Number(body.harga_product ?? 0),
                img_product: body.img_product ?? current.img_product,
                kategori_product: body.kategori_product,
                promo: body.promo,
                updatedAt: serverTimestamp(),
            });

            return jsonResponse({ msg: "Data berhasil dirubah" });
        }

        if (method === "DELETE") {
            await deleteDoc(productSnap.ref);
            return jsonResponse({ msg: "Data berhasil dihapus!" });
        }
    }

    return null;
};

const isDraft = (transaksi: any) =>
    transaksi.buktiBayar === null && transaksi.cash === null;

const handleCarts = async (method: string, paths: string[], body: JsonBody) => {
    if (method === "GET" && paths.length === 1) {
        return jsonResponse({ response: await getCarts() });
    }

    if (method === "POST" && paths.length === 1) {
        const qty = Number(body.qty ?? 1);
        const productId = Number(body.productId);
        const userId = Number(body.userId);
        const transaksiId = Number(body.transaksiId);

        if (!productId || !userId || !transaksiId || qty < 1) {
            return jsonResponse({ msg: "Data keranjang tidak valid." }, 400);
        }

        const transaksiSnap = await findDocByNumericId(
            COLLECTIONS.transaksi,
            transaksiId,
        );

        if (!transaksiSnap) {
            return jsonResponse({ msg: "Transaksi tidak ditemukan." }, 404);
        }

        const transaksi = normalizeDoc(transaksiSnap);

        if (!isDraft(transaksi)) {
            return jsonResponse(
                { msg: "Transaksi ini sudah checkout dan tidak bisa diubah." },
                400,
            );
        }

        const existing = await getDocs(
            query(
                collection(db, COLLECTIONS.cart),
                where("productId", "==", productId),
                where("userId", "==", userId),
                where("transaksiId", "==", transaksiId),
                limit(1),
            ),
        );

        if (!existing.empty) {
            const snap = existing.docs[0];
            await updateDoc(snap.ref, {
                qty: increment(qty),
                updatedAt: serverTimestamp(),
            });
            const updatedSnap = await getDoc(snap.ref);

            return jsonResponse({
                msg: "Qty produk di keranjang berhasil ditambah.",
                response: normalizeDoc(updatedSnap),
            });
        }

        const id = await nextId(COLLECTIONS.cart);
        const docRef = await addDoc(collection(db, COLLECTIONS.cart), {
            id,
            qty,
            productId,
            userId,
            transaksiId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        const newSnap = await getDoc(docRef);

        return jsonResponse({
            msg: "Data berhasil dibuat!",
            response: normalizeDoc(newSnap),
        });
    }

    if (paths.length === 2) {
        const cartSnap = await findDocByNumericId(
            COLLECTIONS.cart,
            Number(paths[1]),
        );

        if (!cartSnap) {
            return jsonResponse(
                { msg: "Data keranjang tidak ditemukan." },
                404,
            );
        }

        if (method === "PATCH") {
            const qty = Number(body.qty);

            if (!qty || qty < 1) {
                return jsonResponse({ msg: "Qty minimal 1." }, 400);
            }

            await updateDoc(cartSnap.ref, {
                qty,
                updatedAt: serverTimestamp(),
            });

            return jsonResponse({
                msg: "Data berhasil dirubah",
                response: normalizeDoc(await getDoc(cartSnap.ref)),
            });
        }

        if (method === "DELETE") {
            await deleteDoc(cartSnap.ref);
            return jsonResponse({ msg: "Data berhasil dihapus!" });
        }
    }

    return null;
};

const createOrGetDraftTransaction = async (body: JsonBody) => {
    const namaPelanggan = body.namaPelanggan?.trim();

    if (!namaPelanggan) {
        return jsonResponse({ msg: "Nama pelanggan wajib diisi." }, 400);
    }

    const transaksi = await getTransactions();
    const existingDraft = transaksi.find(
        (item) => item.namaPelanggan === namaPelanggan && isDraft(item),
    );

    if (existingDraft) {
        return jsonResponse({
            msg: "Transaksi draft aktif ditemukan.",
            response: existingDraft,
        });
    }

    const id = await nextId(COLLECTIONS.transaksi);
    const docRef = await addDoc(collection(db, COLLECTIONS.transaksi), {
        id,
        uuid: createUuid(),
        namaPelanggan,
        totalHarga: 0,
        buktiBayar: null,
        catatanTambahan: null,
        status: null,
        cash: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return jsonResponse({
        response: await normalizeTransaksi(await getDoc(docRef)),
    });
};

const checkoutTransaction = async (id: number, body: JsonBody) => {
    const transaksiSnap = await findDocByNumericId(COLLECTIONS.transaksi, id);

    if (!transaksiSnap) {
        return jsonResponse({ msg: "Transaksi tidak ditemukan." }, 404);
    }

    const transaksi = await normalizeTransaksi(transaksiSnap);

    if (!transaksi.keranjangs?.length) {
        return jsonResponse({ msg: "Keranjang masih kosong." }, 400);
    }

    const cartItems = Array.isArray(body.items) ? body.items : [];

    for (const item of cartItems) {
        const qty = Number(item.qty);

        if (!item.id || !qty || qty < 1) {
            return jsonResponse(
                { msg: "Qty item transaksi tidak valid." },
                400,
            );
        }

        const cart = transaksi.keranjangs.find(
            (keranjang: any) => Number(keranjang.id) === Number(item.id),
        );

        if (!cart) {
            return jsonResponse(
                { msg: `Item keranjang ${item.id} tidak ditemukan.` },
                400,
            );
        }
    }

    for (const item of cartItems) {
        const cartSnap = await findDocByNumericId(
            COLLECTIONS.cart,
            Number(item.id),
        );
        if (cartSnap) {
            await updateDoc(cartSnap.ref, {
                qty: Number(item.qty),
                updatedAt: serverTimestamp(),
            });
        }
    }

    const refreshed = await normalizeTransaksi(transaksiSnap);
    const totalHarga = refreshed.keranjangs.reduce(
        (total: number, item: any) => {
            const harga = Number(item.product?.harga_product ?? 0);
            return total + harga * Number(item.qty);
        },
        0,
    );
    const cash = Number(body.cash);

    // if (!cash || cash < totalHarga) {
    //     return jsonResponse(
    //         {
    //             msg: "Nominal cash kurang dari total transaksi.",
    //             totalHarga,
    //         },
    //         400,
    //     );
    // }

    await updateDoc(transaksiSnap.ref, {
        totalHarga,
        buktiBayar: body.buktiBayar ?? "CASH",
        catatanTambahan: body.catatanTambahan ?? null,
        cash,
        status: body.status ?? true,
        updatedAt: serverTimestamp(),
    });

    return jsonResponse({
        msg: "Checkout berhasil.",
        response: await normalizeTransaksi(await getDoc(transaksiSnap.ref)),
    });
};

const handleTransactions = async (
    method: string,
    paths: string[],
    searchParams: URLSearchParams,
    body: JsonBody,
) => {
    if (method === "GET" && paths.length === 1) {
        const namaPelanggan = searchParams.get("namaPelanggan")?.trim();
        const draftParam = searchParams.get("isDraft");
        let transaksi = await getTransactions();

        if (namaPelanggan) {
            transaksi = transaksi.filter(
                (item) => item.namaPelanggan === namaPelanggan,
            );
        }

        if (draftParam === "true") {
            transaksi = transaksi.filter(isDraft);
        }

        if (draftParam === "false") {
            transaksi = transaksi.filter((item) => !isDraft(item));
        }

        return jsonResponse({ response: transaksi });
    }

    if (method === "POST" && paths.length === 1) {
        return createOrGetDraftTransaction(body);
    }

    if (paths.length === 3 && paths[2] === "checkout" && method === "POST") {
        return checkoutTransaction(Number(paths[1]), body);
    }

    if (paths.length === 2) {
        if (method === "GET") {
            const transaksi = await getTransactions();
            const response = transaksi.find((item) => item.uuid === paths[1]);

            if (!response) {
                return jsonResponse({ msg: "Transaksi tidak ditemukan." }, 404);
            }

            return jsonResponse(response);
        }

        const transaksiSnap = await findDocByNumericId(
            COLLECTIONS.transaksi,
            Number(paths[1]),
        );

        if (!transaksiSnap) {
            return jsonResponse({ msg: "Transaksi tidak ditemukan." }, 404);
        }

        if (method === "PATCH") {
            await updateDoc(transaksiSnap.ref, {
                ...body,
                updatedAt: serverTimestamp(),
            });

            return jsonResponse({ msg: "Data berhasil dirubah!" });
        }

        if (method === "DELETE") {
            await deleteDoc(transaksiSnap.ref);
            return jsonResponse({ msg: "Data berhasil dihapus!" });
        }
    }

    return null;
};

export const firebaseFetch = async (
    input: string,
    init?: RequestInit,
): Promise<FirebaseApiResponse> => {
    try {
        const url = new URL(input);
        const paths = url.pathname.split("/").filter(Boolean);
        const method = (init?.method ?? "GET").toUpperCase();
        const body = await getBody(init);
        const resource = paths[0];

        let response: FirebaseApiResponse | null = null;

        if (resource === "login") {
            response = await handleLogin(method, paths, body);
        } else if (resource === "user") {
            response = await handleUsers(method, paths, body);
        } else if (resource === "forgotPass") {
            response = await handleForgotPassword(method, body);
        } else if (resource === "product") {
            response = await handleProducts(method, paths, body);
        } else if (resource === "cart") {
            response = await handleCarts(method, paths, body);
        } else if (resource === "transaksi") {
            response = await handleTransactions(
                method,
                paths,
                url.searchParams,
                body,
            );
        }

        return (
            response ?? jsonResponse({ msg: "Endpoint tidak ditemukan." }, 404)
        );
    } catch (error: any) {
        return jsonResponse(
            { msg: error.message ?? "Firebase API error." },
            400,
        );
    }
};
