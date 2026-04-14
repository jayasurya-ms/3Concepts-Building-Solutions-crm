import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEnd,
  Bell,
  Settings2,
  LayoutDashboard,
  Boxes,
  MapPinHouse,
  User,
  LandPlot,
  BarChart3,
  Cog,
  Gauge,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    NOTIFICATION: {
      title: "Notification",
      url: "/notification",
      icon: Bell,
    },
    EMPLOYEE: {
      title: "Employee",
      url: "/employee",
      icon: User,
    },
    SITE: {
      title: "Site",
      url: "/site",
      icon: LandPlot,
    },
    KM_READING: {
      title: "KM Reading",
      url: "/km-reading",
      icon: Gauge,
    },
    TRIP: {
      title: "Trip",
      url: "/trip",
      icon: Boxes,
    },

    REPORT: {
      title: "Report",
      url: "#2",
      icon: BarChart3,
      items: [
        {
          title: "Employee",
          url: "/report/employee",
          icon: User,
        },
        {
          title: "Site",
          url: "/report/site",
          icon: LandPlot,
        },
        {
          title: "KM Reading",
          url: "/report/km-reading",
          icon: Gauge,
        },
        {
          title: "Petrol Reimbursement",
          url: "/report/petrol_reimbursement",
          icon: Boxes,
        },
        {
          title: "Site Expenses",
          url: "/report/site_expenses",
          icon: MapPinHouse,
        },
      ],
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Cog,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: [
      "DASHBOARD",
      "EMPLOYEE",
      "SITE",
      "KM_READING",
      "TRIP",
      "NOTIFICATION",
      "REPORT",
      "SETTINGS",
    ],

    navMainReport: ["DASHBOARD", "SETTINGS"],
  },
  2: {
    navMain: [
      "DASHBOARD",
      "EMPLOYEE",
      "SITE",
      "KM_READING",
      "TRIP",
      "NOTIFICATION",
      "REPORT",
      "SETTINGS",
    ],

    navMainReport: ["DASHBOARD", "SETTINGS"],
  },
  3: {
    navMain: [
      "DASHBOARD",
      "EMPLOYEE",
      "SITE",
      "KM_READING",
      "TRIP",
      "NOTIFICATION",
      "REPORT",
      "SETTINGS",
    ],

    navMainReport: ["DASHBOARD", "SETTINGS"],
  },
  4: {
    navMain: [
      "DASHBOARD",
      "EMPLOYEE",
      "SITE",
      "KM_READING",
      "TRIP",
      "NOTIFICATION",
      "REPORT",
      "SETTINGS",
    ],

    navMainReport: ["DASHBOARD", "SETTINGS"],
  },
};

const LIMITED_MASTER_SETTINGS = {
  title: "Master Settings",
  url: "#",
  isActive: false,
  icon: Settings2,
  items: [
    {
      title: "Chapters",
      url: "/master/chapter",
    },
  ],
};

const useNavigationData = (userType) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userType] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config, customItems = {}) => {
      return permissionKeys
        .map((key) => {
          if (key === "MASTER_SETTINGS_LIMITED") {
            return LIMITED_MASTER_SETTINGS;
          }
          return config[key];
        })
        .filter(Boolean);
    };

    const navMain = buildNavItems(
      permissions.navMain,
      // { ...NAVIGATION_CONFIG.COMMON, ...NAVIGATION_CONFIG.MODULES },
      { ...NAVIGATION_CONFIG.COMMON },
      // { MASTER_SETTINGS_LIMITED: LIMITED_MASTER_SETTINGS }
    );

    // const navMainReport = buildNavItems(
    //   permissions.navMainReport,
    //   NAVIGATION_CONFIG.REPORTS
    // );

    return { navMain };
  }, [userType]);
};

export function AppSidebar({ ...props }) {
  const [openItem, setOpenItem] = useState(null);
  const companyDetails = useSelector((state) => state.company.companyDetails);
  const companyName = companyDetails?.company_name;

  const TEAMS_CONFIG = useMemo(
    () => [
      {
        name: "3 Concepts Building Solutions",
        logo: GalleryVerticalEnd,
        plan: "",
      },
    ],
    [],
  );

  const user = useSelector((state) => state.auth.user);
  const { navMain, navMainReport } = useNavigationData(user?.user_type);
  const initialData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: TEAMS_CONFIG,
    navMain,
    navMainReport,
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
        {/* <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };
