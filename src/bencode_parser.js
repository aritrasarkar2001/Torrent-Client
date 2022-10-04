const encoded = "";

let decoded;

//byte string "4:spam"
//integers "i-3e"
//lists "l4:spam4:eggse"
//dictionaries "d3:cow3:mooe"

const notString = (char) => {
    if(char == "i" || char == "l" || char == "d"){
        //console.log("y");
        return true;
    }
    //console.log("n");
    return false;
}

const isNum = (char) => {
    if(parseInt(char) <= 9  && parseInt(char) >= 0){
        return true;
    }
    return false;
}

const end_val = (str) => {
    let count = 0;
    let val = 0;
    for(let i=0;i<str.length;i++){

        if(i < str.length-1 && str[i+1] == ":" && isNum(str[i])){
            i = i+parseInt(str[i]);
        }

        if(str[i] == "i" || str[i] == "l" || str[i] == "d"){
            count++;
        }

        if(str[i] == 'e'){
            count--;
            val = i;
        }

        if(count == 0){
            return val;
        }
    }

    return Nan;
}

const ben_int = (str) => {
    //convert the str into an int
    //console.log("i "+ str);
    return parseInt(str);
}

const ben_str = (str) => {
    //remove the number of bytes part
    //console.log("s " + str);
    return str;
}

const ben_list = (str) => {
    //create a list of values
    //console.log("l " + str);
    let temp_list = [];
    let end;
    let temp_val;

    for(let i=0; i<str.length; i++){
        if(notString(str[i])){
            if(str[i] == "i"){
                end = end_val(str.slice(i))
                temp_val = ben_int(str.slice(i+1, i+end))
            }else if(str[i] == "l"){
                end = end_val(str.slice(i));
                temp_val = ben_list(str.slice(i+1, i+end));
            }else if(str[i] == "d"){
                end = end_val(str.slice(i));
                temp_val = ben_dict(str.slice(i+1, i+end));
            }

            temp_list.push(temp_val);
            i = i+end;

        }else{
            let str_end = i;
            while(str[str_end+1] != ":"){
                str_end++;
            }
            let len = parseInt(str.slice(i,str_end+1));
            temp_val = ben_str(str.slice(str_end+2, str_end+2+len))
            temp_list.push(temp_val);
            //console.log(i);
            i = str_end+2+len - 1;
        }
    }

    return temp_list;

}

const ben_dict = (str) => {

    //create a dict of keys and values
    //console.log("d " + str);
    let temp_dict = {};
    let temp_key = "";
    let end;
    let temp_val;
    let count = 0;

    for(let i=0; i<str.length; i++){
        count++;
        if(notString(str[i])){
            if(str[i] == "i"){
                end = end_val(str.slice(i))
                temp_val = ben_int(str.slice(i+1, i+end))
            }else if(str[i] == "l"){
                end = end_val(str.slice(i));
                //console.log(i + " " + str.slice(i+1, i+end) + " " + str.slice(i));
                temp_val = ben_list(str.slice(i+1, i+end));
            }else if(str[i] == "d"){
                end = end_val(str.slice(i));
                temp_val = ben_dict(str.slice(i+1, i+end));
            }

            temp_dict[temp_key] = temp_val;
            i = i+end;

        }else{
            let str_end = i;
            while(str[str_end+1] != ":"){
                str_end++;
            }
            let len = parseInt(str.slice(i,str_end+1));
            temp_val = ben_str(str.slice(str_end+2, str_end+2+len));
            if(count%2 == 1){
                temp_key = temp_val;
            }else{
                temp_dict[temp_key] = temp_val;
            }
            //console.log(i);
            i = str_end+2+len-1;
        }
    }

    return temp_dict;

}

const bencode = (str) => {

    let start = 0;
    let end = str.length - 1;
    let ans;

    if(str[start] == "i"){
        ans = ben_int(str.slice(start+1, end));
    }else if(str[start] == "l"){
        ans = ben_list(str.slice(start+1, end));
    }else if(str[start] == "d"){
        //console.log(str.slice(start+1, end));
        ans = ben_dict(str.slice(start+1, end));
    }else{
        ans = ben_str(str.slice(start+2));
    }

    return ans;
}

//obj = { "a" : "a2", "v" : "fklsd" };
//console.log(obj);
// console.log(bencode("d4:spaml1:a1:bee"))
// console.log(bencode("5:apple"))
// console.log(bencode("i-856e"));
// console.log(bencode("lli1ei2eeli3ei4eee"))
// console.log(bencode("d3:cow3:moo4:spam4:eggse"))
