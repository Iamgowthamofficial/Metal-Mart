import { Request , Response} from "express";
import Product from "../models/Products.js";
import cloudinary from "../config/cloudinary.js";
import { run } from "node:test";

 


 export const getProducts = async (req: Request, res: Response) => {
    try {
        const {page=1, limit=10} = req.query;
        const query = {isActive: true};

        const total = await Product.countDocuments(query);
      const products = await Product.find(query).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));

      res.json({
        success: true,
        data: products,
        pagination: {
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
          total,
        },
      })
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };

  // get single product

  export const getProduct = async (req: Request, res: Response) => {
    try {
        

      const product = await Product.findById(req.params.id);

      if(!product){
        return res.status(404).json({ error: 'Product not found' });
      }
       res.json({ success: true, data: product });

    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };


  // create product

  export const createProduct = async (req: Request, res: Response) => {
    try {
        let images = [];

        if(req.files && (req.files as any).length > 0){
            const uploadPromises = (req.files as any).map((file: any) => {

                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {folder: 'Metal-Martproducts'},(error, result)=>{
                            if(error) reject(error);
                           else resolve(result!.secure_url);
                        }
                    )
                    uploadStream.end(file.buffer);
                })
            })
             images = await Promise.all(uploadPromises);                
        }
        let sizes = req.body.sizes || [];
        if(typeof sizes == "string"){
            try{
                sizes = JSON.parse(sizes);
            }catch(e){
                sizes = sizes.split(",").map((size: string) => size.trim()).filer((size: string) => size !== "");
            }
        }
        if(!Array.isArray(sizes)) sizes = [sizes];

        const productionData = {
            ...req.body,
            images: images,
            sizes
        }
        if(images.length === 0){
            return res.status(400).json({ error: 'Please upload at least one image' });
        }
        const product = await Product.create(productionData);;
        res.status(201).json({ success: true, data: product });

    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };


  // update product

  export const updateProduct = async (req: Request, res: Response) => {
    try {
        let images: string[] = [];

        if(req.body.existingImages){
            if(Array.isArray(req.body.existingImages)){
                images = [...req.body.existingImages];
        }else{
            images = [req.body.existingImages];
        }

        if(req.files && (req.files as any).length > 0){
            const uploadPromises = (req.files as any).map((file: any) => {

                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {folder: 'Metal-Martproducts'},(error, result)=>{
                            if(error) reject(error);
                           else resolve(result!.secure_url);
                        }
                    )
                    uploadStream.end(file.buffer);
                })
            })
            const newImages = await Promise.all(uploadPromises);   
            images = [...images, ...newImages];             
                
        }
        const updates = {...req.body};
        if(req.body.size){
            let sizes = req.body.size;
            if(typeof sizes == "string"){
                try{
                    sizes = JSON.parse(sizes);
                }catch(e){
                    sizes = sizes.split(",").map((size: string) => size.trim()).filer((size: string) => size !== "");
                }
            }
            if(!Array.isArray(sizes)) sizes = [sizes];
            updates.sizes = sizes;
        }
        if(req.body.existingImages || req.files && (req.files as any).length > 0){
            updates.images = images;
        }
        delete updates.existingImages;

        const product = await Product.findByIdAndUpdate(req.params.id, updates, {new: true, runValidators: true});
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });

    } 
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// delete product

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        if(product.images && product.images.length > 0){
            const deletePromises = product.images.map((image: string) => {
                const publicIdMatch = image.match(/\/v\d+\/(.+)\.[a-z]+$/);
                const publicId = publicIdMatch ? publicIdMatch[1] : null;
                if(publicId){
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            })
            await Promise.all(deletePromises);
        }
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}