import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { LuLayoutDashboard } from "react-icons/lu";
import { RiShoppingCartLine } from "react-icons/ri";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { RiProductHuntLine } from "react-icons/ri";
import { LuBarChart3 } from "react-icons/lu";
import { BsBoxSeam } from "react-icons/bs";
import { FaChalkboardTeacher } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";
import { TbSettingsCog } from "react-icons/tb";
import { IoIosArrowDown } from "react-icons/io";

import "./navbar.css";

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation(); // React Router hook to get the current location

  const navItems = [
    { icon: <LuLayoutDashboard />, title: "Dashboard", path: "/" },
    {
      icon: <BsBoxSeam />,
      title: "Inventory Management",
      subItems: [
        { title: "Products", path: "/products" },
        { title: "Stock Levels", path: "/inventory/stock-levels" },
        { title: "Expiry Management", path: "/inventory/expiry-management" },
      ],
    },
    {
      icon: <BiPurchaseTagAlt />,
      title: "Sales Management",
      subItems: [
        { title: "New Sale", path: "/new-sale" },
        { title: "Sale History", path: "/sale-history" },
      ],
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Customer Management",
      path: "/customer",
    },
    {
      icon: <RiShoppingCartLine />,
      title: "Purchase Management",
      path: "/purchase",
    },
    {
      icon: <IoPersonOutline />,
      title: "Employee Management",
      path: "/employee",
    },
    { icon: <RiProductHuntLine />, title: "Other Expenses", path: "/expenses" },
    { icon: <TbSettingsCog />, title: "Reports", path: "/reports" },
    { icon: <TbSettingsCog />, title: "Settings", path: "/settings" },
  ];

  return (
    <div className="navbarMainContainer">
      <div className="navItemsContainer">
        {navItems.map((item, index) => {
          // Check if the current location matches any subItem
          const isDropdownActive =
            activeDropdown === index ||
            item.subItems?.some(
              (subItem) => location.pathname === subItem.path
            );

          return (
            <div key={index} className="navItemWrapper">
              <NavLink
                to={item.subItems ? "#" : item.path} // Prevent navigation for dropdowns
                className={({ isActive }) => {
                  if (item.subItems) {
                    return isDropdownActive
                      ? "navItem activeNavItem"
                      : "navItem";
                  }
                  return isActive ? "navItem activeNavItem" : "navItem";
                }}
                onClick={(e) => {
                  if (item.subItems) {
                    e.preventDefault(); // Prevent navigation for dropdown items
                    setActiveDropdown(isDropdownActive ? null : index); // Toggle the dropdown
                  } else {
                    setActiveDropdown(null); // Close all dropdowns for regular NavItems
                  }
                }}
              >
                <div className="navIcon">{item.icon}</div>
                <p className="navTitle">{item.title}</p>

                {item.subItems && (
                  <div className="dropdownarrowIcon">
                    <IoIosArrowDown />
                  </div>
                )}
              </NavLink>

              {/* Dropdown Menu */}
              {item.subItems && isDropdownActive && (
                <div className="dropdownMenu">
                  {item.subItems.map((subItem, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subItem.path}
                      className={({ isActive }) =>
                        isActive
                          ? "dropdownItem activeDropdownItem"
                          : "dropdownItem"
                      }
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click propagation
                        setActiveDropdown(index); // Keep dropdown open for this item
                      }}
                    >
                      <span>{subItem.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
