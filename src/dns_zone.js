import nsupdate from './util/nsupdate';
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
        if(request.updateKey){
        return `zone ${request.zone}\n` +
            `key ${request.updateKey.algorithm}:${request.updateKey.name} ${request.updateKey.secret}\n` +
            `${command}send\n`;
        }else{
            throw new Error('Missing updateKey!');
        }
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
                let new_record = dns_record(record,request.zone);
                if(hashtable[new_record.hash] === undefined){
                    return nsupdateCommands(new_record.add_command());
                }else{
                    throw new Error(`Such record already is in the ${request.zone} zone!`);
                }
            case 'update':
                index = hashtable[hash];
                if(index > -1){
                    let old_record = list[index];
                    let new_record = dns_record(record,request.zone);
                    if(!hashtable[new_record.hash]){
                        return nsupdateCommands(old_record.update_command(new_record));
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
                    return nsupdateCommands(deleted_record.delete_command());
                }else{
                    throw new Error(`Not such record in ${request.zone} zone!`);
                } 
        }
    };



    const add_record = record => {
        try{
            let nsupdateCommand = command('add',null,record);
            return nsupdate(nsupdateCommand);
        }catch(err){
            Promise.reject(err);
        }
    }
    const update_record = (hash,record) => {
        try{
            let nsupdateCommand = command('update',hash,record);
            return nsupdate(nsupdateCommand);
        }catch(err){
            Promise.reject(err);
        }
    }
    const delete_record = hash => {
        try{
            let nsupdateCommand = command('delete',hash);
            return nsupdate(nsupdateCommand);
        }catch(err){
            Promise.reject(err);
        }
    }

    return new Promise((resolve,reject) => {
        transferZone(request,transferRecord).then(() => {
            resolve({
                getRecords,
                add : add_record,
                update : update_record,
                delete : delete_record
            });
        },err => reject(err));
    });
}
