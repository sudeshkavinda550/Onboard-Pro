import Sidebar from '../components/layout/Sidebar';

const EmployeeLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;
