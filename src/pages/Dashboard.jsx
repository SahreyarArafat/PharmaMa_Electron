import React from "react";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";

import "../styles/dashboard.css";

// Icons
import { IoPersonSharp } from "react-icons/io5";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { LuTimerOff } from "react-icons/lu";
import { HiArchiveBoxXMark } from "react-icons/hi2";

// Graph charts
import PieChart from "../components/Charts/PieChart.jsx";
import LineChart from "../components/Charts/LineChart.jsx";
import BarChart from "../components/Charts/barChart.jsx";

const Dashboard = () => {
  const shortcutLinks = [
    {
      icon: <IoPersonSharp />,
      title: "Total Customer",
      link: "",
      colorClass: "shortcutLinkIcon_1",
    },
    {
      icon: <BiPurchaseTagAlt />,
      title: "Total Sales",
      link: "",
      colorClass: "shortcutLinkIcon_2",
    },
    {
      icon: <LuTimerOff />,
      title: "Product Expired",
      link: "",
      colorClass: "shortcutLinkIcon_3",
    },
    {
      icon: <HiArchiveBoxXMark />,
      title: "Out of Stock",
      link: "",
      colorClass: "shortcutLinkIcon_4",
    },
    {
      icon: <BiPurchaseTagAlt />,
      title: "Total Sales",
      link: "",
      colorClass: "shortcutLinkIcon_2",
    },
  ];

  const overviewCards = [
    {
      icon: <IoPersonSharp />,
      title: "Total Customer",
      number: "120",
      link: "",
      colorClass: "overviewCardIcon_1",
    },
    {
      icon: <BiPurchaseTagAlt />,
      title: "Total Sales",
      number: "234",
      link: "",
      colorClass: "overviewCardIcon_2",
    },
    {
      icon: <LuTimerOff />,
      title: "Product Expired",
      number: "54",
      link: "",
      colorClass: "overviewCardIcon_3",
    },
    {
      icon: <HiArchiveBoxXMark />,
      title: "Out of Stock",
      number: "56",
      link: "",
      colorClass: "overviewCardIcon_4",
    },
  ];

  return (
    <div>
      <Topbar />
      <div className="navbarAndContentMaincontainer">
        <Navbar />
        <div className="contentContainer">
          <div className="shortcutLinkContainer">
            {shortcutLinks.map((item, index) => (
              <div className="shortcutLink" key={index}>
                <div className="shortcutLinkContent">
                  <div className={`shortcutLinkIcon ${item.colorClass}`}>
                    {item.icon}
                  </div>
                  <div className="shortcutLinkText">
                    <p className="overviewTitle">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="overviewCardsContainer">
            {overviewCards.map((item, index) => (
              <div className="overviewCard" key={index}>
                <div className="overviewCardContent">
                  <div className={`overviewCardIcon ${item.colorClass}`}>
                    {item.icon}
                  </div>
                  <div className="overviewCardText">
                    <h4>{item.title}</h4>
                    <h2>{item.number}</h2>
                  </div>
                </div>
                <div className="cardDetailLink">Show Details</div>
              </div>
            ))}
          </div>

          <div className="shortGraphContainer">
            <div className="shortGraph">
              <BarChart />
            </div>
            <div className="shortGraph">
              <LineChart />
            </div>
            <div className="shortGraph">
              <PieChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
