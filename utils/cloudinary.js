import { v2 as cloudinary } from 'cloudinary'


cloudinary.config({ 
    cloud_name: 'dmgy5y8ec', 
    api_key: '733266495152475', 
    api_secret: '***************************' 
  });

  export const uploadImage = async (file, folder) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload( file ,  {folder: folder}, (error, result) => {
        if (result && result.secure_url){
          return resolve(result.secure_url)
        }
        console.log(error.message)
        return reject ({message : error.message})
      }) 
    })
  }
  
  // Function to upload multiple images
  export const uploadMoreImages  = (images) =>{
    return new Promise((resolve, reject) =>{
      const uploads  =  images.map(async (base) =>uploadImage(base, "posts") )
      Promise.all(uploads).then(values  => resolve(values)).catch((err) => reject(err))
    })
  }
  



export default cloudinary