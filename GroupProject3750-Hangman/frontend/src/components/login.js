import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'

export default function Login(){
    const [form, setForm] = useState({
        username: "",

    });
    const navigate = useNavigate();


    const updateForm = e => {
        const { name, value } = e.target
        setForm(prevForm => ({...prevForm,[name]: value}))
      }
    

     const onSubmit = async e => {
        e.preventDefault();
        // const newPerson = {...form};
        const response =  await fetch("http://localhost:4000/login", {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            credentials: 'include',
            body: JSON.stringify(form),
        })
        .catch(error => {
            window.alert(error);
            return
        });

        if(response.ok)
        { //message says its valid navigate to next page
           navigate("/hangman");
        } else {
            window.alert("An error occured during the login process...")
                 setForm({email: "", password: ""}); //clear the form
        }
      }

      return(
        <div>
            <h2>Welcome to Hangman!</h2>
            <h3>Please enter your username</h3>
            <form onSubmit={onSubmit}>
                <div>
                    <label>Username: </label>
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={updateForm}
                />
                </div>
                <br/>
                <input
                    type="submit"
                    value="Login"
                />
            </form>
        </div>
    );
}