import passport from 'passport';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

export default class CartServices {

    constructor(DB) {
        this.DB = DB;
    }

    addProductToCart = (req, res, next) => {
        const { sub } = req.user;
        try {
            const { id, quantity } = req.body;

            if (!id) {
                return res.status(200).json({
                    error: true,
                    msg: "product Id cannot be empty",
                });
            }

            if (!quantity) {
                return res.status(200).json({
                    error: true,
                    msg: "quantity cannot be empty",
                });
            }

            // find product
            const Query = `SELECT products.* FROM products where products.id="${id}" AND products.is_deleted=0`;
            this.DB.query(Query, (err, products) => {
                if (err) {
                    return res.status(200).json({
                        error: true,
                        msg: 'Error getting products',
                    });
                };
                console.log('products', products);
                if (products.length > 0) {
                    const product = products[0];
                    const SearchQuery = `SELECT * FROM cart WHERE userId="${sub}" AND productId="${id}" and is_deleted=0 and orderId IS NULL`;
                    this.DB.query(SearchQuery, (err, result) => {
                        console.log('result from cart', result);
                        if (err) return res.status(401).json({ msg: "Error adding cart" });
                        const newProduct = { ...product, quantity, totalPrice: (Number(quantity) * Number(product.price)) };
                        console.log('newProduct', newProduct)
                        if (result.length > 0) {
                            const UpdateQuery = `UPDATE cart SET quantity="${quantity}", totalPrice="${(Number(quantity) * Number(product.price))}" where productId="${id}" AND userId="${sub}"`;
                            this.DB.query(UpdateQuery, (err, result) => {
                                if (err) return res.status(401).json({ msg: "Error adding cart" });
                                // return res.status(200).json({
                                //     error: false,
                                //     result: newProduct,
                                // })
                                const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
                                this.DB.query(Q, (err, result) => {
                                    if (err) return res.status(500).json({ error: err });
                                    return res.status(200).json({
                                        error: false,
                                        result,
                                    })
                                });
                            });
                        } else {
                            const Q = `INSERT INTO cart SET ?`;
                            const Options = {
                                id: uuidv4(),
                                userId: sub,
                                productId: id,
                                quantity,
                                price: product.price,
                                totalPrice: (Number(quantity) * Number(product.price)),
                                dateCreated: new Date(),
                            };
                            this.DB.query(Q, Options, (err, result) => {
                                if (err) return res.status(401).json({ msg: "Error adding cart" });
                                // return res.status(200).json({
                                //     error: false,
                                //     result: Options,
                                // })
                                const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
                                this.DB.query(Q, (err, result) => {
                                    if (err) return res.status(500).json({ error: err });
                                    return res.status(200).json({
                                        error: false,
                                        result,
                                    })
                                });
                            });
                        }
                    });
                }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    createOrder = (req, res, next) => {
        const { sub } = req.user;
        try {
            const { postalCode, country, city, apartment, address, phoneNumber } = req.body;

            if (!postalCode || !country || !city || !apartment
                || !address || !phoneNumber) {
                return res.status(400).json({
                    error: true,
                    message: errors,
                })
            }
            // check if user has orders in cart
            const orderQuery = `SELECT * FROM cart WHERE userId = "${sub}" and is_deleted=0 and orderId IS NULL`;
            this.DB.query(orderQuery, (err, orderResult) => {
                if (err) return res.status(500).json({ error: err });
                if (orderResult.length > 0) {
                    const Q = `INSERT INTO orders SET ?`;
                    const id = uuidv4();
                    const Options = {
                        id,
                        userId: sub,
                        status: 'PENDING',
                        orderId: `#${id.slice((id.length - 10), id.length)}`,
                        dateCreated: new Date(),
                        postalCode, country, city, apartment, address, phoneNumber
                    };
                    this.DB.query(Q, Options, (err, result) => {
                        if (err) return res.status(401).json({ msg: "Error adding cart" });
                        const Q = `UPDATE cart SET orderId="${id}" where orderId IS NULL AND userId="${sub}"`;
                        this.DB.query(Q, (err, result) => {
                            if (err) return res.status(401).json({ msg: "Error adding cart" });
                            return res.status(200).json({
                                error: false,
                                result: Options,
                            })
                        });
                    });
                } else {
                    return res.status(200).json({
                        error: true,
                        message: "You have no product in cart"
                    })
                }
            });
        } catch (error) {
            console.log('error', error)
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    updateProductsInCart = (req, res, next) => {
        const { sub } = req.user;
        const { productId } = req.params;
        try {
            const { quantity, status } = req.body;

            const Q = `UPDATE cart SET (? IS NULL OR quantity=?), (? IS NULL OR status = ?) where productId=? AND userId=?`;
            const data = {
                quantity, status, productId, sub
            }
            this.DB.query(Q, data, (err, result) => {
                if (err) return res.status(401).json({ msg: "Error adding cart" });
                // return res.status(200).json({
                //     error: false,
                //     result: Options,
                // })
                const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
                this.DB.query(Q, (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    return res.status(200).json({
                        error: false,
                        result,
                    })
                });
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    adminUpdateProductsInCart = (req, res, next) => {
        const { sub } = req.user;
        const productId = req.params;
        try {
            const { numberofOrders, status } = req.body;
            let errors = [];

            if (!quantity) {
                errors.push({ msg: "numberofOrders cannot be empty" });
            }

            const Q = `UPDATE cart SET (? IS NULL OR numberofOrders=?), (? IS NULL OR status = ?)where productId=?`;
            const data = {
                quantity, status, productId
            }
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(401).json({ msg: "Error adding cart" });
                return res.status(200).json({
                    error: false,
                    result: Options,
                })
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getProductsInCart = (req, res) => {
        const { sub } = req.user;
        try {
            const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getmyOrders = (req, res) => {
        const { sub } = req.user;
        try {
            const Q = `SELECT JSON_ARRAYAGG(JSON_OBJECT('id', cart.id, 'productId', products.id, 'name', products.name, 'price', products.price, 'description', products.description, 'old_price', products.old_price, 'images', products.images, 'quantity', cart.quantity, 'totalPrice', cart.totalPrice )) as carts, orders.* from orders inner join cart ON orders.id=cart.orderId inner join products on cart.productId=products.id WHERE orders.userId = "${sub}" and cart.is_deleted=0 GROUP BY orders.id`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        } catch (error) {
            console.log('error getting orders: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getmyCart = (req, res) => {
        const { sub } = req.user;
        try {
            let errors = [];
            const Q = `SELECT cart.*, JSON_ARRAYAGG(JSON_OBJECT('id', products.id, 'name', products.name)) as products FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getOrders = (req, res) => {
        const { sub } = req.user;
        try {
            let errors = [];
            const Q = `SELECT * FROM orders, order_product.*, products.* from orders WHERE is_deleted=0
            inner join order_product ON order_product.orderId=orders.id 
            inner join products on products.id=order_product.productId where products.is_deleted=false`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    removeProduct = (req, res) => {
        console.log("params", req.params.id)
        const { productId } = req.params;
        const { sub } = req.user;
        const Q = `UPDATE cart SET is_deleted=1 where productId="${productId}" AND userId="${sub}"`;

        this.DB.query(Q, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            // return res.status(200).json({
            //     error: false,
            //     result: Options,
            // })
            const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        });
    }

    emptyCart = (req, res) => {
        const { sub } = req.user;
        const productId = req.params;
        const Q = `UPDATE cart SET is_deleted=1 where userId=${sub}`;

        this.DB.query(Q, Options, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            // return res.status(200).json({
            //     error: false,
            //     result: Options,
            // })
            const Q = `SELECT cart.*, products.* FROM cart inner join products on products.id=cart.productId WHERE cart.userId = "${sub}" and cart.is_deleted=0 and cart.orderId IS NULL`;
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(500).json({ error: err });
                return res.status(200).json({
                    error: false,
                    result,
                })
            });
        });
    }

}