import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Spinner } from '@chakra-ui/react';

export default function OrderByDeliveryPersonReportChart({
  data,
  isLoading,
  month,
}: {
  data: any;
  isLoading: boolean;
  month: string;
}) {
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  // find current month data
  const report = data?.reports
    ?.find((report: any) => report.period === month)
    ?.deliveryManOrderCounts?.filter((d: any) => !!d?.deliveryMan?.id);

  const series = [
    {
      data: report?.map((r: any) => r.count),
    },
  ];

  // chart option
  const options: ApexOptions = {
    chart: {
      id: 'order-delivery-person-report-chart',
      stacked: false,
      offsetY: 0,
      toolbar: { show: false },
    },

    legend: { show: false },
    dataLabels: { enabled: false },

    // axis
    xaxis: {
      categories: report?.map((r: any) => r.deliveryMan.fullName),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          cssClass: 'fill-secondary-600',
        },
      },
    },

    // yaxis
    yaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickAmount: 6,
    },

    plotOptions: {
      bar: {
        columnWidth: '30%',
        borderRadius: 3,
        colors: {
          ranges: data?.reports?.map((report: any) => ({
            from: report.totalEarnings,
            to: report.totalEarnings,
            color:
              report.period?.substring(0, 3) === currentMonth
                ? 'var(--color-green-500)'
                : 'var(--color-secondary-500)',
          })),
        },
      },
    },

    // grid
    grid: {
      borderColor: '#E2E8F0',
      padding: {
        bottom: 0,
      },
    },
  };

  return (
    <div className="w-full aspect-[3/2] max-h-64">
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <Chart series={series} options={options} type="bar" height={256} />
      )}
    </div>
  );
}
