import jwt_decode from 'jwt-decode';

const token = localStorage.getItem("token");

if (token) {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) { // Eğer token süresi geçmişse
        localStorage.removeItem("token"); // Token'ı kaldır
        window.location.href = "/login"; // Kullanıcıyı login sayfasına yönlendir
    }
}

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        // Token varsa, kullanıcıyı ana sayfaya yönlendirebilirsiniz
        navigate("/home");
    } else {
        // Token yoksa, login sayfasına yönlendirin
        navigate("/login");
    }
}, []);
