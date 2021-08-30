import child_process from "child_process";

export default function nsupdate(commands){
    return new Promise((resolve,reject) => {
        let output = '';
        const nsupdateProcess = child_process.spawn('nsupdate',['-v']);
 
        nsupdateProcess.stdout.on('data', data => {
            output += data.toString();
        });
        nsupdateProcess.stderr.on('data', err => {
            reject(err.toString());
        });
        nsupdateProcess.on('close', code => {
        
            if(code === 0){
                resolve(output);
            }else{
                reject(`nsupdate exit with ${code}`);
            }

        });
        nsupdateProcess.on('error',err => {
            reject(err.message);
        });
        process.nextTick(() => {
            nsupdateProcess.stdin.end(commands);
        });
    });
}