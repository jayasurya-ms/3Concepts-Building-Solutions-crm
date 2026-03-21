export const LOGIN = {
  postLogin: "/panel-login",
  forgotpassword: "/panel-send-password",
};
export const PANEL_CHECK = {
  getPanelStatus: "/panel-check-status",
  getEnvStatus: "/panel-fetch-dotenv",
};
export const NOTIFICATION_API = {
  list: "/notification",
  create: "/notification",
  byId: (id) => `/notification/${id}`,
  updateById: (id) => `/notification/${id}?_method=PUT`,
  updateStatus: (id) => `/notifications/${id}/status`,
};
export const EMPLOYEE_API = {  //refer this for employee
  list: "/member",
  create: "/member",
  byId: (id) => `/member/${id}`,
  updateById: (id) => `/member/${id}?_method=PUT`,
  updateStatus: (id) => `/members/${id}/status`,
};
//old

export const PROFILE = {
  profile: "/panel-fetch-profile",
  updateprofile: "/panel-update-profile",
};
export const DASHBOARD = {
  list: "/dashboard",
};
//for reference
export const BANNER_API = {
  list: "/banner",
  create: "/banner",
  byId: (id) => `/banner/${id}`,
  updateById: (id) => `/banner/${id}?_method=PUT`,
};
export const PURCHASE_PRODUCT_API = {
  list: "/purchase-product",
  byId: (id) => `/purchase-product/${id}`,
  updateById: (id) => `/purchase-product/${id}`,
  deleteSubById: (id) => `/purchase-product-sub/${id}`,
  deleteById: (id) => `/purchase-product/${id}`,
};
export const PURCHASE_COMPONENT_API = {
  list: "/purchase-component",
  byId: (id) => `/purchase-component/${id}`,
  updateById: (id) => `/purchase-component/${id}`,
  deleteSubById: (id) => `/purchase-component-sub/${id}`,
  deleteById: (id) => `/purchase-component/${id}`,
};
export const ORDERS_API = {
  list: "/order",
  byId: (id) => `/order/${id}`,
  updateById: (id) => `/order/${id}`,
  updateStatus: (id) => `/orders/${id}/status`,
  deleteSubProductById: (id) => `/order-sub/${id}`,
  deleteSubComponentById: (id) => `/order-sub1/${id}`,
  deleteById: (id) => `/order/${id}`,
};
export const PRODUCTION_API = {
  list: "/production",
  byId: (id) => `/production/${id}`,
  updateById: (id) => `/production/${id}`,
  deleteById: (id) => `/production/${id}`,
  deleteSubById: (id) => `/production-sub/${id}`,
  updateStatus: (id) => `/productions/${id}/status`,
};

export const REPORT_API = {
  productstock: "/product-stock-report",
  componentstock: "/component-stock-report",
  purchaseProductReport: "/purchase-product-report",
  purchaseComponentReport: "/purchase-component-report",
  orderReport: "/order-report",
};

export const COMPANY_API = {
  list: "/company",
  create: "/company",
  dropdown: "/companys",
  byId: (id) => `/company/${id}`,
  updateById: (id) => `/company/${id}?_method=PUT`,
};
export const FAQ_API = {
  list: "/faq",
  create: "/faq",
  byId: (id) => `/faq/${id}`,
  updateById: (id) => `/faq/${id}`,
  deleteFaq: (id) => `/faqSub/${id}`,
  updateStatus: (id) => `/faqtopStatus/${id}`,
};
export const BLOG_API = {
  list: "/blog",
  create: "/blog",
  dropdown: "/blogs",
  byId: (id) => `/blog/${id}`,
  delete: (id) => `/blog/${id}`,
  deleteSub: (id) => `/blog-sub/${id}`,
  deleteRelated: (id) => `/blog-related/${id}`,
  updateById: (id) => `/blog/${id}?_method=PUT`,
};
export const GALLERY_API = {
  list: "/link-gallery",
  create: "/link-gallery",
  dropdown: "/link-gallerys",
  byId: (id) => `/link-gallery/${id}`,
  delete: (id) => `/link-gallery/${id}`,
  updateById: (id) => `/link-gallery/${id}?_method=PUT`,
};
export const PAGE_TWO_API = {
  dropdown: "/page-two",
};
export const CHANGE_PASSWORD_API = {
  create: "/panel-change-password",
};
export const COUNTRY_API = {
  list: "/country",
  dropdown: "/countrys",
  byId: (id) => `/country/${id}`,
};
export const LETUREYOUTUBE_API = {
  list: "/lecture-youtube",
  byId: (id) => `/lecture-youtube/${id}`,
  updateById: (id) => `/lecture-youtube/${id}?_method=POST`,
  updateById: (id) => `/lecture-youtube/${id}?_method=PUT`,
};

export const COURSE_API = {
  courses: "/courses",
};
export const GALLERYAPI = {
  gallery: "/link-gallery",
  byId: (id) => `/link-gallery/${id}`,
  updateById: (id) => `/link-gallery/${id}?_method=PUT`,
};
export const YOUTUBEFOR_API = {
  list: "/youtubeFor",
};
export const NEWSLETTER_API = {
  list: "/newsletter",
};
export const STUDENT_API = {
  list: "/student",
  byId: (id) => `/student/${id}`,
  updateById: (id) => `/student/${id}?_method=PUT`,
};
