import React, { type PropsWithChildren } from "react";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

const MainLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
