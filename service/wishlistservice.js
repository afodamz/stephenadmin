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
                        return res.status(200).json({
                            error: false,
                            result: Options,
                        })
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
            const Q = `SELECT * FROM wishlist WHERE userId = "${sub}" and is_deleted=0`;
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
        const productId = req.params;
        const { sub } = req.user;
        const Q = `UPDATE wishlist SET is_seleted=1 where productId=${productId} AND userId=${sub}`;

        this.DB.query(Q, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            return res.status(200).json({
                error: false,
                result: Options,
            })
        });
    }

    emptyWishlist = (req, res) => {
        const { sub } = req.user;
        const Q = `UPDATE wishlist SET is_seleted=1 where userId=${sub}`;

        this.DB.query(Q, Options, (err, result) => {
            if (err) return res.status(401).json({ msg: "Error adding cart" });
            return res.status(200).json({
                error: false,
                result: Options,
            })
        });
    }

}