import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import MailServices from './mailService.js';

export default class Orderervices {


    constructor(DB) {
        this.DB = DB;
    }

    deleteGrillsService = (req, res) => {
        var id = req.params.id

        const Query = "UPDATE products SET is_deleted = ? WHERE id = ?";
        const Options = [true, id];
        this.DB.query(Query, Options, (err, result) => {
            if (err) throw err;
            if (result) {
                req.flash(
                    "success_msg",
                    "Category Successfully added."
                );
                res.redirect("/admin/categories");
            }
        });
    }

    createOrderSubmitService = (req, res) => {
        var { firstName, lastName, email, address,
            apartment, city, country, postalCode, numberofOrders,
            productId, } = req.body;
        let errors = [];

        if (!firstName || !lastName || !email || !address
            || !apartment || !city || !country || !postalCode
            || !numberofOrders || !productId
        ) {
            errors.push({ msg: "Please enter required fields" })
        }

        if (errors.length > 0) {
            res.status(400).send({ message: `Please enter values` });
        }

        if (!productId) {
            res.status(404).send({ message: `Product with id not foound` });
        } else {
            const ProductQuery = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false AND products.id='${productId}' GROUP BY products.id`;
            this.DB.query(ProductQuery, (err, product) => {
                if (err) throw err;
                res.status(404).send({ message: `Product with id ${productId} not found` });
            });

            const Query = "INSERT INTO order SET ?";
            const id = uuidv4();
            const Options = {
                id,
                firstName,
                lastName,
                email,
                address,
                apartment,
                city,
                status: "PENDING",
                country,
                postalCode,
                numberofOrders,
                productId,
                dateCreated: new Date()
            };
            this.DB.query(Query, Options, (err, result) => {
                if (err) res.status(404).send({ message: `Error creating order` });;
                if (result[0]) {
                    return;
                } else {
                    const mailService = new MailServices();
                    mailService.sendMail({message: ``, recipients: email, subject: "New Order"})
                    res.json({
                        success: true,
                        data: result,
                        message: "Order created successfully"
                    })
                }
            });
        }
    }

    updateOrderSubmitService = (req, res) => {
        var { id, firstName, lastName, email, address,
            apartment, city, country, postalCode, numberofOrders, status,
            productId, } = req.body;

        if (!id) {
            res.status(404).send({ message: `Product with id not foound` });
        } else {
            if (!productId) {
                res.status(404).send({ message: `Product with id not foound` });
            } 
            const ProductQuery = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false AND products.id='${productId}' GROUP BY products.id`;
            this.DB.query(ProductQuery, (err, product) => {
                if (err) throw err;
                res.status(404).send({ message: `Product with id ${productId} not found` });
            });

            const Query = "INSERT INTO order SET ?";
            const id = uuidv4();
            const Options = {
                id,
                firstName,
                lastName,
                email,
                address,
                apartment,
                city,
                status,
                country,
                postalCode,
                numberofOrders,
                productId,
                dateCreated: new Date()
            };
            this.DB.query(Query, Options, (err, result) => {
                if (err) res.status(404).send({ message: `Error creating order` });;
                if (result[0]) {
                    return;
                } else {
                    res.json({
                        success: true,
                        data: result,
                        message: "Order created successfully"
                    })
                }
            });
        }
    }

}