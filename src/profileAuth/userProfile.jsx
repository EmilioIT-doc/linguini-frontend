import { use, useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../store/authSlice";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";

export default function UserProfile() {
  const [user, setUser] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(API_URL.get.user, axiosConfig())
      .then((res) => setUser(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(API_URL.post.logout, {}, axiosConfig());

      dispatch(clearAuth());
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      alert("Logout failed");
    }
  };
  console.log("Este es mi user de mierda: ",user);
  

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}
