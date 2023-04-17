import passport from 'passport';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';

export default class WishlistServices {

    constructor(DB) {
        this.DB = DB;
    }

    addProductToWishlist = (req, res, next) => {
        const { sub } = req.user;
        try {
            const { productId } = req.body;
            let errors = [];

            if (!productId) {
                errors.push({ msg: "productId cannot be empty" });
            }

            const Q = `SELECT * FROM wishlist WHERE userId = "${sub}" and productId="${productId}" and is_deleted=0`;
            this.DB.query(Q, (err, result) => {
                if (err) throw err;
                let wishlist = result[0];
                if (!wishlist) {
                    const Q = `INSERT INTO wishlist SET ?`;
                    const Options = {
                        id: uuidv4(),
                        userId: sub,
                        productId,
                        dateCreated: new Date()
                    };
                    this.DB.query(Q, Options, (err, result) => {
                        if (err) return res.status(401).json({ msg: "Error adding wishlist" });
                        const Q = `SELECT wishlist.*, products.* FROM wishlist join products on wishlist.productId=products.id WHERE userId = "${sub}" and products.is_deleted=0 and wishlist.is_deleted=0 `;
                        this.DB.query(Q, (err, result) => {
                            if (err) return res.status(500).json({ error: err });
                            return res.status(200).json({
                                error: false,
                                result,
                            })
                        });
                    });
                } else {
                    return res.status(401).json({ msg: "Product already added to wishlist", result: wishlist })
                }
            });


        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    getProductsInWishlst = (req, res) => {
        const { sub } = req.user;
        try {
            let errors = [];
            // const Q = `SELECT * FROM wishlist WHERE userId = "${sub}" and is_deleted=0
            // join products on wishlist.productId = products.id`;
            const Q = `SELECT wishlist.*, products.* FROM wishlist inner join products on wishlist.productId=products.id WHERE userId = "${sub}" and products.is_deleted=0 and wishlist.is_deleted=0 `;
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

    getWishlst = (req, res) => {
        const { productIds } = req.query;
        try {
            let errors = [];
            // const Q = `SELECT * FROM wishlist WHERE userId = "${sub}" and is_deleted=0
            // join products on wishlist.productId = products.id`;
            const Q = `SELECT wishlist.*, products.* FROM wishlist join products on wishlist.productId=products.id WHERE userId IN ("${productIds}") and products.is_deleted=0 and wishlist.is_deleted=0 `;
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
        const {productId} = req.params;
        const { sub } = req.user;
        const Q = `UPDATE wishlist SET is_deleted=1 where productId='${productId}' AND userId='${sub}'`;
        console.log('Q', Q)
        this.DB.query(Q, (err, result) => {
            if (err) {
                console.log('err', err)
                return res.status(401).json({ msg: "Error removing wishlist" });}
            console.log('result', result)
            this.DB.query(Q, (err, result) => {
                if (err) return res.status(401).json({ msg: "Error getting wishlist" });
                const Q = `SELECT wishlist.*, products.* FROM wishlist inner join products on wishlist.productId=products.id WHERE userId = "${sub}" and products.is_deleted=0 and wishlist.is_deleted=0 `;
                this.DB.query(Q, (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    return res.status(200).json({
                        error: false,
                        result,
                    })
                });
            });
        });
    }

    emptyWishlist = (req, res) => {
        const { sub } = req.user;
        const Q = `UPDATE wishlist SET is_seleted=1 where userId=${sub}`;

        this.DB.query(Q, Options, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            this.DB.query(Q, Options, (err, result) => {
                if (err) return res.status(401).json({ msg: "Error adding wishlist" });
                const Q = `SELECT wishlist.*, products.* FROM wishlist join products on wishlist.productId=products.id WHERE userId = "${sub}" and products.is_deleted=0 and wishlist.is_deleted=0 `;
                this.DB.query(Q, (err, result) => {
                    if (err) return res.status(500).json({ error: err });
                    return res.status(200).json({
                        error: false,
                        result,
                    })
                });
            });
        });
    }

}