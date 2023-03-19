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
            const { productId, numberofOrders } = req.body;
            let errors = [];

            if (!productId) {
                errors.push({ msg: "productId cannot be empty" });
            }

            if (!numberofOrders) {
                errors.push({ msg: "numberofOrders cannot be empty" });
            }

            const Q = `INSERT INTO order_product SET ?`;
            const Options = {
                id: uuidv4(),
                userId: sub,
                productId,
                numberofOrders
            };
            this.DB.query(Q, Options, (err, result) => {
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

    createOrder = (req, res, next) => {
        const { sub } = req.user;
        try {
            const { postalCode, country, city, apartment, address } = req.body;
            // check if user has orders in cart
            const orderQuery = `SELECT * FROM order_product WHERE userId = "${sub}" and is_deleted=0 and productId=null`;
            this.DB.query(orderQuery, (err, orderResult) => {
                if (err) return res.status(500).json({ error: err });
                if (orderResult.length > 0) {
                    const Q = `INSERT INTO orders SET ?`;
                    const id = uuidv4();
                    const Options = {
                        id,
                        userId: sub,
                        orderId: `#${id.slice((id.length - 10), id.length)}`,
                        dateCreated: new Date(),
                        postalCode, country, city, apartment, address
                    };
                    this.DB.query(Q, Options, (err, result) => {
                        if (err) return res.status(401).json({ msg: "Error adding cart" });
                        const Q = `UPDATE order_product SET orderId=${id} where productId=null AND userId=${sub}`;
                        this.DB.query(Q, (err, result) => {
                            if (err) return res.status(401).json({ msg: "Error adding cart" });
                            return res.status(200).json({
                                error: false,
                                result: Options,
                            })
                        });
                    });
                }else{
                    return res.status(200).json({
                        error: true,
                        message: "You have no product in cart"
                    })
                }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    updateProductsInCart = (req, res, next) => {
        const { sub } = req.user;
        const productId = req.params;
        try {
            const { numberofOrders } = req.body;
            let errors = [];

            if (!numberofOrders) {
                errors.push({ msg: "numberofOrders cannot be empty" });
            }

            const Q = `UPDATE order_product SET numberofOrders=${numberofOrders} where productId=${productId} AND userId=${sub}`;
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
            let errors = [];
            const Q = `SELECT * FROM order_product WHERE userId = "${sub}" and is_deleted=0`;
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
            let errors = [];
            const Q = `SELECT * FROM orders, order_product.*, products.* from orders WHERE userId = "${sub}" and is_deleted=0
            inner join order_product ON order_product.orderId=orders.id 
            inner join products on products.id=order_product.productId where products.is_deleted=false`;
            // const Q = `SELECT * FROM orders, order_product.*, products.* from orders WHERE userId = "${sub}" and is_deleted=0
            // inner join order_product ON order_product.orderId=orders.id 
            // inner join products on products.id=order_product.productId where products.is_deleted=false`;
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

    getmyCart = (req, res) => {
        const { sub } = req.user;
        try {
            let errors = [];
            const Q = `SELECT * FROM order_product.*, products.* from order_product WHERE userId = "${sub}" and is_deleted=0
            inner join products on products.id=order_product.productId where products.is_deleted=0`;
            // const Q = `SELECT * FROM orders, order_product.*, products.* from orders WHERE userId = "${sub}" and is_deleted=0
            // inner join order_product ON order_product.orderId=orders.id 
            // inner join products on products.id=order_product.productId where products.is_deleted=false`;
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
        const productId = req.params;
        const { sub } = req.user;
        const Q = `UPDATE order_product SET is_seleted=1 where productId=${productId} AND userId=${sub}`;

        this.DB.query(Q, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            return res.status(200).json({
                error: false,
                result: Options,
            })
        });
    }

    emptyCart = (req, res) => {
        const { sub } = req.user;
        console.log("params", req.params.id)
        const productId = req.params;
        const Q = `UPDATE order_product SET is_seleted=1 where userId=${sub}`;

        this.DB.query(Q, Options, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            return res.status(200).json({
                error: false,
                result: Options,
            })
        });
    }

}