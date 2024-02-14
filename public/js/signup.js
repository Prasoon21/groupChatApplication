async function signup(event){
    try{
        event.preventDefault();

        const fname = document.getElementById('fname');
        const emailId = document.getElementById('emailid');
        const phoneNo = document.getElementById('phoneno');
        const passId = document.getElementById('passid');

        const user = {
            fname: fname,
            emailId: emailId,
            phoneNo: phoneNo,
            passId: passId
        }

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