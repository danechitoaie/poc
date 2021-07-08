import fetch from "node-fetch";
import { useEffect, useState } from "react";

const getURL = path => {
    return `https://checkout-poc.anechitoaie.ro/s/RefArch/dw/shop/v20_4${path}?client_id=3d09df51-3ce2-42c7-9ecf-af4873ff1885`;
};

function Poc1() {
    const [cartData, setCartData] = useState([]);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const setupSession = async () => {
            if (!userData) {
                try {
                    const authResponse = await fetch(getURL("/customers/auth"), {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: "guest" })
                    });

                    const authJson = await authResponse.json();

                    const authType = authJson.auth_type;
                    const authHeader = authResponse.headers.get("Authorization");
                    const authCustomerId = authJson.customer_id;

                    const basketsResponse = await fetch(getURL("/baskets"), {
                        method: "POST",
                        headers: { Authorization: authHeader, "Content-Type": "application/json" }
                    });
                    const basketJson = await basketsResponse.json();

                    const basketId = basketJson.basket_id;

                    const sessionsResponse = await fetch(getURL("/sessions"), {
                        method: "POST",
                        headers: { Authorization: authHeader }
                    });
                    await sessionsResponse.text();

                    setUserData({
                        authType,
                        authCustomerId,
                        authHeader,
                        basketId
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        };

        setupSession();
    }, []);

    const addToCart = async productId => {
        if (!userData) {
            alert("ERROR: Missing session!");
        }

        if (!userData.authHeader) {
            alert("ERROR: Missing basketId!");
        }

        if (!userData.basketId) {
            alert("ERROR: Missing basketId!");
        }

        const addToBasketResponse = await fetch(getURL(`/baskets/${userData.basketId}/items`), {
            method: "POST",
            headers: { Authorization: userData.authHeader, "Content-Type": "application/json" },
            body: JSON.stringify([{ product_id: productId, quantity: 1 }])
        });

        const addToBasketJson = await addToBasketResponse.json();
        setCartData(addToBasketJson.product_items.map(p => `(${p.product_id}: ${p.product_name})`));
    };

    return (
        <div>
            <p>Hello world!</p>
            <div>
                <p>Products: {cartData.length > 0 ? cartData.join(", ") : 'n/a'}</p>
            </div>
            <div>
                <button onClick={() => addToCart("mitsubishi-lt-52246M")}>Add to cart mitsubishi-lt-52246M</button>
                <button onClick={() => addToCart("microsoft-xbox360-consoleM")}>
                    Add to cart microsoft-xbox360-consoleM
                </button>
            </div>
            <div>
                <a href="https://checkout-poc.anechitoaie.ro/cart">Cart</a>
            </div>
        </div>
    );
}

export default Poc1;
