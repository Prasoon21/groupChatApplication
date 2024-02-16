async function signUp(event){
    try{
        event.preventDefault();

        const fname = document.getElementById('fname').value;
        const emailId = document.getElementById('emailid').value;
        const phoneNo = document.getElementById('phoneno').value;
        const passId = document.getElementById('passid').value;

        
        const user = {
            fname: fname,
            emailId: emailId,
            phoneNo: phoneNo,
            passId: passId
        }
        console.log(user)

        const res = await axios.post("http://localhost:3000/user/signup", user);

        console.log(res);

        document.getElementById('fname').value = '';
        document.getElementById('emailid').value = '';
        document.getElementById('phoneno').value = '';
        document.getElementById('passid').value = '';

        alert('User signed up successfully');
    } catch(error){
        if(error.response && error.response.status === 400){
            alert('User already exists, try using different email-id');
            
        } else{
            document.body.innerHTML += "<h4>Something went wrong</h4>";
            console.log(error);
        }
        
    }
}