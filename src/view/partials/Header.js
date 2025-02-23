import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../Components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaw } from "@fortawesome/free-solid-svg-icons";
import { updateProfile } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

function Header({ user, currentPath }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [role, setRole] = useState("");
  const [isNewUser, setIsNewUser] = useState("");
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const logout = () => {
    auth.signOut().then(() => {
      localStorage.clear();
      navigate("/");
      toggleDropdown();
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      const scrollPosition = window.scrollY;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (
          scrollPosition >= sectionTop - sectionHeight / 3 &&
          scrollPosition < sectionTop + sectionHeight - sectionHeight / 3
        ) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + user.uid);

      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.role) {
          setRole(data.role);
        } else {
          setRole("user"); // Default to 'user' if role is null or undefined
        }

        if (data) {
          setUsername(data.username);
          setFullname(data.fullname);
          setIsVerified(data.isVerified);
          setHeaderVisible(true);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
console.log(user)
      // Convert creationTime to Date object
      const creationTime = new Date(user.metadata.creationTime);
      const targetDate = new Date("2024-05-27T00:00:00Z");

      // Check if the user is new
      if (creationTime >= targetDate) {
        setIsNewUser(true);
        console.log("This user is a new user.");
      } else {
        setIsNewUser(false);
        console.log("This user is not a new user.");
      }
    }
  }, [user]);

  const homePage = () => {
    if (dropdownOpen) {
      setDropdownOpen(false); // Close dropdown if open
    }
    navigate("/");
  };

  const updateAccount = async () => {
    toggleDropdown();
    try {
      // Update displayName in Firebase
      await updateProfile(auth.currentUser, {
        displayName: user.displayName,
      });
      navigate("/account");
    } catch (error) {
      console.error(error);
    }
  };

  const pet = () => {
    toggleDropdown();
    navigate("/pet");
  };

  const login = () => {
    navigate("/signIn");
  };

  const aboutPage = () => {
    navigate("/#about");
  };

  const servicesPage = () => {
    navigate("/#services");
  };

  const contactPage = () => {
    navigate("/#contact");
  };
  const adminDashboard = () => {
    toggleDropdown();
    navigate("/admin/dashboard");
  };
  const shouldShowHeader =
    !currentPath.startsWith("/admin") &&
    currentPath !== "/manager" &&
    currentPath !== "/veterinary";

  if (!shouldShowHeader) {
    return null; // Don't render the header if it's a login or admin page
  }

  return (
    <header className={`header ${headerVisible ? "" : "hidden"}`}>
      <a href="#home" onClick={homePage} className="logo">
        <FontAwesomeIcon icon={faPaw} /> Pet Center
      </a>
      <i className="bx bx-menu" id="menu-icon"></i>
      <nav className="navbar">
        <a
          href="#home"
          onClick={homePage}
          className={activeSection === "home" ? "active home" : "home"}
        >
          Home
        </a>
        <a
          href="#about"
          onClick={aboutPage}
          className={activeSection === "about" ? "active home" : "home"}
        >
          About
        </a>
        <a
          href="#services"
          onClick={servicesPage}
          className={activeSection === "services" ? "active home" : "home"}
        >
          Services
        </a>
        <a
          href="#contact"
          onClick={contactPage}
          className={activeSection === "contact" ? "active home" : "home"}
        >
          Contact
        </a>
        {/* <div onClick={logout}>Logout</div> */}

        {shouldShowHeader &&
          (user && isVerified ? (
            <div className="dropdown" ref={dropdownRef}>
              <span onClick={toggleDropdown} className="username">
                {user.displayName || username || fullname}
              </span>
              <div className={`dropdown-content ${dropdownOpen ? "show" : ""}`}>
                <div onClick={updateAccount}>Account</div>
                <div onClick={pet}>Pet</div>
                {role === "admin" && (
                  <div onClick={adminDashboard}>Admin Dashboard</div>
                )}
                <div onClick={logout}>Logout</div>
              </div>
            </div>
          ) : (
            <button onClick={login}>Login</button>
          ))}
      </nav>
    </header>
  );
}

export default Header;
