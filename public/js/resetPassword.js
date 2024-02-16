async function forgotpsw(event){
    event.preventDefault();
    try{
        const emailId = document.getElementById('emailId').value;
        console.log('entered email for password reset', emailId);

        const response = await axios.post('http://localhost:3000/password/forgotpassword', {
            emailId
        });

        console.log('API Response: ', response.data);
        document.getElementById('emailId').value = '';
    } catch(err){
        console.log('something went wrong in entering mailid: ', err);
    }
}