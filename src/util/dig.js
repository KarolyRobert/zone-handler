import child_process from "child_process";

export default function dig(params){
    return new Promise((resolve,reject) => {
        const dig = child_process.spawn('dig',params);
        let result = '';
        dig.stdout.on('data', data => {
            result += data.toString();
        });
        dig.stderr.on('data', err => {
            reject(err.toString());
        });
        dig.on('close', code => {
        
            if(code === 0){
                resolve(result);
            }else{
                reject(`dig exit with ${code}`);
            }
        });
        dig.on('error',err => {
            reject(err.message);
        });
    });
}