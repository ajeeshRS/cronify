interface props {
  enabledJobCount: number;
  disabledJobCount: number;
  failedCount: number;
}

export default function DashboardStats({
  enabledJobCount,
  disabledJobCount,
  failedCount,
}: props) {
  return (
    <div className="w-full grid md:grid-cols-4 grid-cols-2 gap-5 items-center justify-between py-4">
      <div className=" w-full h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
        <p className="font-semibold text-3xl">{enabledJobCount}</p>
        <p className="md:text-base text-sm py-1">Enabled CronJobs</p>
      </div>
      <div className="w-full h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
        <p className="font-semibold text-3xl">{disabledJobCount}</p>
        <p className="md:text-base text-sm py-1">Disabled CronJobs</p>
      </div>
      <div className="w-full h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
        <p className="font-semibold text-3xl">
          {enabledJobCount === 0 ? 0 : enabledJobCount - failedCount}
        </p>
        <p className="md:text-base text-sm py-1"> Successful CronJobs</p>
      </div>
      <div className="w-full h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
        <p className="font-semibold text-3xl">{failedCount}</p>
        <p className="md:text-base text-sm py-1">Failed CronJobs</p>
      </div>
    </div>
  );
}
