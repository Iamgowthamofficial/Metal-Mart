import  express from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middlewares/upload.js";
import { authorize, protect } from "../middlewares/auth.js";

const ProductRouter = express.Router();

ProductRouter.get('/', getProducts);
ProductRouter.get('/:id', getProduct);

ProductRouter.post('/',upload.array('images',5), protect, authorize('admin'), createProduct);

ProductRouter.put('/:id',upload.array('images',5), protect, authorize('admin'), updateProduct);

ProductRouter.delete('/:id', protect, authorize('admin'), deleteProduct);






export default ProductRouter