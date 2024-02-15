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

        document.getElementById('fname') = '';
        document.getElementById('emailid') = '';
        document.getElementById('phoneno') = '';
        document.getElementById('passid') = '';

        alert('User signed up successfully');
    } catch(error){
        document.body.innerHTML += "<h4>Something went wrong</h4>";
        console.log(error);
    }
}