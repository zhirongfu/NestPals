import { GoogleLogout } from 'react-google-login'

const clientId = "630038648737-et0vimlmiicfif7gshrk4cnthh162j58.apps.googleusercontent.com";

function Logout() {

    const onSuccess = () => {
        console.log("Log out successful!");
    }

    return (
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText={"Logout"}
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;