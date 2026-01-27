export default function ParityPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Rate Parity Monitor</h1>
            <p className="text-gray-400 font-medium">Compare prices across all OTA channels to detect and fix disparities.</p>

            <div className="mt-12 p-12 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4 text-gray-700 font-bold">🚧 Under Construction</div>
                <p className="text-gray-500 max-w-sm">This feature will analyze live OTA data to ensure your rates are consistent everywhere.</p>
            </div>
        </div>
    );
}
