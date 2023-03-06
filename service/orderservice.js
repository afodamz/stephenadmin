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
            apartment, city, country, postalCode, productOrders,
        } = req.body;
        let errors = [];

        if (!firstName || !lastName || !email || !address
            || !apartment || !city || !country || !postalCode
        ) {
            errors.push({ msg: "Please enter required fields" })
        }

        if (errors.length > 0) {
            res.status(400).send(errors);
        }

        const Query = "INSERT INTO orders SET ?";
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
            dateCreated: new Date()
        };
        this.DB.query(Query, Options, (err, result) => {
            if (err) {
                console.log(err)
                res.status(404).json({ message: `Error creating order` });
            }

            const allOrders = [];
            for (const order of productOrders) {
                const { productId, numberofOrders } = order;
                const ProductQuery = `SELECT products.* FROM products 
    inner JOIN product_categories ON product_categories.productId=products.id
    inner JOIN category ON category.id= product_categories.categoriesId 
    where products.is_deleted=false AND category.is_deleted=false AND products.id='${productId}' GROUP BY products.id LIMIT 1`;
                this.DB.query(ProductQuery, Options, (err, productresult) => {
                    if (err) throw err;
                    if (productresult.length > 0) {
                        const ProductOrderQuery = "INSERT INTO order_product SET ?";
                        const Options = {
                            total: (Number(numberofOrders) * Number(productresult[0].price)),
                            productId,
                            orderId: id,
                            numberofOrders,
                        };
                        const tableData = { ...productresult[0], ...Options }
                        this.DB.query(ProductOrderQuery, Options, (err, result) => {
                            if (err) throw err;
                            allOrders.push(tableData)
                        });
                    }
                });
            }
            const mailService = new MailServices();
            setTimeout(function () {
                let tableRow = ``;
                for (const tableOrder of allOrders) {
                    tableRow += `<tr>
                    <td>${tableOrder.name}</td>
                    <td>${tableOrder.numberofOrders}</td>
                    <td>${tableOrder.price}</td>
                    <td>${tableOrder.total}</td>
                </tr>`
                }
                mailService.sendMail({
                    message: `
                        <table>
                    <tr>
                        <td>Hello Admin,</td>
                    </tr>
                    <tr>
                        <td>A new order was created and the information are seen below as follows:<br/><br/><br/></td>
                    </tr>
                    <tr>
                        <td>FirstName</td>
                        <td>${firstName}</td>
                    </tr>
                    <tr>
                        <td>LastName</td>
                        <td>${lastName}</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>${email}</td>
                    </tr>
                    <table cellspacing="20">
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total Price</th>
                        </tr>
                        ${tableRow}
                    </table>
                </table>
                `,
                    recipients: process.env.ADMIN_MAIL, subject: "New Order"
                })
            }, 7000);

            res.status(201).json({
                success: true,
                data: result,
                message: "Order created successfully"
            });
        });
    }

    updateOrderSubmitService = (req, res) => {
        var { id, firstName, lastName, email, address,
            apartment, city, country, postalCode, numberofOrders, status,
            productId, } = req.body;

        if (!id) {
            res.status(404).json({ message: `Product with id not foound` });
        } else {
            if (!productId) {
                res.status(404).json({ message: `Product with id not foound` });
            }
            const ProductQuery = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false AND products.id='${productId}' GROUP BY products.id`;
            this.DB.query(ProductQuery, (err, product) => {
                if (err) throw err;
                res.status(404).json({ message: `Product with id ${productId} not found` });
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
                        message: "Order created successfully"
                    })
                }
            });
        }
    }

}