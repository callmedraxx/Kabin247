import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Spinner } from '@chakra-ui/react';

export default function OrderStatusReportChart({
  data,
  isLoading,
  onMonthSelect,
}: {
  data: any;
  isLoading: boolean;
  onMonthSelect: (month: string) => void;
}) {
  const series = [
    {
      name: 'Completed',
      data: data?.reports?.map((report: any) => report.counts.completed),
    },
    {
      name: 'Canceled',
      data: data?.reports?.map((report: any) => report.counts.canceled),
    },
    {
      name: 'Failed',
      data: data?.reports?.map((report: any) => report.counts.failed),
    },
  ];

  // chart option
  const options: ApexOptions = {
    chart: {
      id: 'earning-report',
      stacked: false,
      offsetY: 0,
      toolbar: { show: false },
      events: {
        dataPointSelection: function (_event, _chartContext, config) {
          const selectedMonth = data?.reports[config.dataPointIndex].period;
          if (selectedMonth) {
            onMonthSelect(selectedMonth);
          }
        },
      },
    },

    dataLabels: { enabled: false },
    legend: {
      show: true,
      horizontalAlign: 'left',
      markers: {
        size: 10,
        customHTML: () => {
          return '<span class="w-32 border-4 rounded-[2px] mr-1" />';
        },
      },
    },
    markers: {
      size: 4,
    },

    colors: [
      'var(--color-green-500)',
      'var(--color-purple-500)',
      'var(--color-red-500)',
      'var(--color-primary-500)',
    ],

    // XAxis
    xaxis: {
      categories: data?.reports?.map((report: any) => report.period?.substring(0, 3)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          cssClass: 'fill-secondary-600',
        },
      },
    },

    // YAzis
    yaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      tickAmount: 6,
    },

    // Plot Option
    plotOptions: {
      line: {
        isSlopeChart: false,
      },
    },

    // stroke
    stroke: {
      show: true,
      width: 2,
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
        <Chart series={series} options={options} type="line" height={256} />
      )}
    </div>
  );
}
