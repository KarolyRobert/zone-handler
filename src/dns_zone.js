import { transferZone } from './util/utils';
import dns_record from './dns_record';

export default function dns_zone(request){ // {zone,server,}
    let list = [];
    let hashtable = {};

    const transferRecord = record => {
        let new_record = dns_record(record,request.zone);
        if(hashtable[new_record.hash] === undefined){
            hashtable[new_record.hash] = list.length;
            list.push(new_record);
        }
    }

    const nsupdateCommands = command => {
        let result = `zone ${request.zone}\nkey ${request.updateKey.algorithm}:${request.updateKey.name} ${request.updateKey.secret}\n`;
        if(typeof command === 'string' || command instanceof String){
            result += `${command}\nsend\n`;
        }else{
            let commands = command.join('\n');
            result += `${commands}\nsend\n`;
        }
        return result;
    };

    const getRecords = () => {
        return list.map(record => {
            return {
                hash:record.hash,
                record:record.record
            }
        });
    }

    const command = (type,hash,record) => {
        let index;
        switch(type){
            case 'add':
                let new_record = ddns_record(record,request.zone);
                if(hashtable[new_record.hash] === undefined){
                    return nsupdateCommands(new_record.add());
                }else{
                    throw new Error(`Such record already is in the ${request.zone} zone!`);
                }
            case 'update':
                index = hashtable[hash];
                if(index > -1){
                    let old_record = list[index];
                    let new_record = ddns_record(record,request.zone);
                    if(!hashtable[new_record.hash]){
                        return nsupdateCommands(old_record.update(new_record));
                    }else{
                        throw new Error(`Such record already is in the ${request.zone} zone!`);
                    }
                }else{
                    throw new Error(`Not such record in ${request.zone} zone!`);
                }
            case 'delete':
                index = hashtable[hash];
                if(index > -1){
                    let deleted_record = list[index];
                    return nsupdateCommands(deleted_record.delete());
                }else{
                    throw new Error(`Not such record in ${request.zone} zone!`);
                } 
        }
    };

    return new Promise((resolve,reject) => {
        transferZone(request,transferRecord).then(() => {
            resolve({
                command,
                getRecords
            });
        },err => reject(err));
    });
}