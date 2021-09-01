import dig from './dig';

const transferZone = (request,addRecordToZone) => {
    return new Promise((resolve,reject) => {
        dig([
            `@${request.server}`,
            request.zone,
            'axfr',
            '-y',
            `${request.transferKey.algorithm}:${request.transferKey.name}:${request.transferKey.secret}`
        ]).then(result => {
            let lines = result.split('\n');
            for(let line of lines){

                if(/^(?:[a-z|0-9|_]{1,}-?[a-z|0-9|_]{1,}\.?){1,}[a-z|0-9|_]{1,}\.\s{1,}\d{1,}\s{1,}IN\s{1,}(?:SOA|TXT|A|AAAA|PTR|CNAME|NS|SRV|MX)\s{1,}.{1,}/.test(line)){
                    addRecordToZone(line);
                }
            }
            resolve();
        },err => reject(err));
    });
}

const getAuthoritative = (zone) => {
    return new Promise((resolve,reject) => {
        dig(['SOA',zone]).then(result => {
            let SOA =/^((?:[a-z|0-9|_]{1,}-?[a-z|0-9|_]{1,}\.){1,}[a-z|0-9|_]{1,})\.\s{1,}\d{1,}\s{1,}IN\s{1,}(?:SOA)\s{1,}((?:[a-z|0-9|_]{1,}-?[a-z|0-9|_]{1,}\.){1,}[a-z|0-9|_]{1,})\..{1,}/gm.exec(result);
         
            resolve({zone:SOA[1],server:SOA[2]});
        },err => reject(err));
    });
}

export { transferZone, getAuthoritative }