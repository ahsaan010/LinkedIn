import multer from "multer"
import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { tmpdir } from "node:os"

let storage=multer.diskStorage({
    destination:(_req,_file,cb)=>{
        cb(null,tmpdir())
    },
    filename:(req,file,cb)=>{
        cb(null,`${randomUUID()}${extname(file.originalname)}`)
    }
})

const upload=multer({ storage })
export default upload