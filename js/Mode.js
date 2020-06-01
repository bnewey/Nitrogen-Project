import 'isomorphic-unfetch';

async function getModeVariables(){
    const route = '/mode/getModeVariables';
    try{
        var data = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(!data.ok){
            throw new Error("getModeVariables returned empty list or bad query")
        }
        var list = await data.json();
        return(list);
    }catch(error){
        throw error;
    }

}

async function setModeVariables( modeVariables){
    const route = '/mode/setModeVariables';
    try{
        var response = await fetch(route,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ modeVariables: modeVariables})
            });
        return response.ok;
    }catch(error){
        console.log(error);
        throw error;
    }

}

module.exports = {
    getModeVariables: getModeVariables,
    setModeVariables: setModeVariables,
};