import React from "react";
import "./topbar.css";
// Icons
import { BsSearch, BsChatLeftText } from "react-icons/bs";
import {
  IoNotificationsOutline,
  IoPersonOutline,
  IoChevronDownOutline,
} from "react-icons/io5";

import Searchbar from "./Searchbar";
import profileImage2 from "../assets/images/profile(2).png";
import companyLogo from "../assets/images/logo.png";

const Topbar = () => {
  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <div className="topbarCompanyLogoImgContainer">
          <img
            src={companyLogo}
            alt="Company Logo"
            className="topbarCompanyLogoImg"
          />
        </div>
      </div>

      <div className="topbarCenter">
        <Searchbar />
      </div>

      <div className="topbarRight">
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <IoNotificationsOutline className="topbarIcon" />
            <span className="topbarIconBadge">8</span>
          </div>
        </div>

        <div className="topbarProfile_IconDevider"></div>

        <div className="topbarProfileContainer">
          <div className="topbarProfileImgContainer">
            <img
              src={profileImage2}
              alt="Profile"
              className="topbarProfileImg"
            />
          </div>

          <div className="topbarProfileIntro">
            <p className="profileName">Arafat Rahman</p>
            <p className="profileDesignation">
              Developer{" "}
              <span className="profileDetailArrow">
                <IoChevronDownOutline />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
