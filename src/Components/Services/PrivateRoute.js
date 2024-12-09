import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";  // 'jwtDecode' fonksiyonunu doğru import ediyoruz

const PrivateRoute = ({ element }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        // Token yoksa login sayfasına yönlendir
        return <Navigate to="/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);  // jwtDecode fonksiyonunu kullanıyoruz
        const currentTime = Date.now() / 1000; // Geçerli zaman

        // Eğer token süresi geçmişse, token'ı kaldır ve login sayfasına yönlendir
        if (decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            return <Navigate to="/login" />;
        }

        // Token geçerliyse, elementi render et
        return element;

    } catch (error) {
        // Token decode edilemediyse (örneğin geçersiz token), login sayfasına yönlendir
        localStorage.removeItem("token");
        return <Navigate to="/login" />;
    }
};

export default PrivateRoute;
