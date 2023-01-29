
import moment from 'moment'

export default class PublicServices {

    constructor(DB) {
        this.DB = DB;
    }

    getCategoriesService = (req, res, DB) => {
        const { name } = req.query;
        const Query = `SELECT * FROM category WHERE is_deleted is false`;
        // const categoriesQuery = `SELECT * FROM category WHERE name = ${name} and is_deleted is false`;
        this.DB.query(Query, (err, allCategories) => {
            if (err) throw err;
            res.render("categories/get", {
                allCategories,
                moment
            });
        });
    }

    getProductService = (req, res) => {
        const Query = `SELECT products.*, JSON_ARRAYAGG(JSON_OBJECT('id', category.id, 'name', category.name)) as categories FROM products 
inner JOIN product_categories ON product_categories.productId=products.id
inner JOIN category ON category.id= product_categories.categoriesId 
where products.is_deleted=false AND category.is_deleted=false GROUP BY products.id ORDER BY products.dateCreated DESC
`;
        this.DB.query(Query, (err, allProdcts) => {
            if (err) throw err;
            res.json({
                success: true,
                datatype: 'ALL PRODUCTS',
                data: allProdcts
            })
        });
    }

}