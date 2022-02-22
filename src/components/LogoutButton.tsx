import {useState} from "react";

const LogoutButton = (props) => {
    const {setCurrentUser} = props;

    const onClick = () => {
        setCurrentUser(null);
        localStorage.clear();
    }
    return (
        <>
            <button onClick={onClick}>Logout!</button>
        </>
    )
}

export default LogoutButton