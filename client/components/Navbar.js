import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
// ...existing code...

const Navbar = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const userData = {
                name: user.fullName,
                email: user.primaryEmailAddress.emailAddress,
                image: user.profileImageUrl
            };

            axios.post("/api/users/create", userData)
                .then(response => console.log("User data saved:", response.data))
                .catch(error => console.error("Error saving user data:", error));
        }
    }, [user]);

    // ...existing code...
};

export default Navbar;
