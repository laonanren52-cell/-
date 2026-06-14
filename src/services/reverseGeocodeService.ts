export type ReverseGeocodeResult = {
  locationName?: string;
  locationAddress?: string;
};

export async function reverseGeocodeWithAmap(input: {
  latitude: number;
  longitude: number;
  amapApiKey?: string;
}): Promise<ReverseGeocodeResult> {
  if (!input.amapApiKey?.trim()) {
    throw new Error("已获取定位，但未配置地图服务 Key，暂时无法识别地点名称。");
  }

  const params = new URLSearchParams({
    key: input.amapApiKey.trim(),
    location: `${input.longitude},${input.latitude}`,
    extensions: "all",
    radius: "1000",
    output: "json",
  });

  const response = await fetch(`https://restapi.amap.com/v3/geocode/regeo?${params.toString()}`);
  if (!response.ok) throw new Error("地图服务暂时无法访问，请稍后重试或手动填写地点。");

  const result = await response.json();
  if (result.status !== "1") {
    throw new Error(result.info || "已获取定位，但暂时无法识别地点名称，请手动填写。");
  }

  const regeocode = result.regeocode ?? {};
  const locationName = regeocode.aois?.[0]?.name || regeocode.pois?.[0]?.name || undefined;
  const locationAddress = regeocode.formatted_address || undefined;

  return {
    locationName: locationName || locationAddress || "当前位置",
    locationAddress,
  };
}

export function getDisplayLocation(card: {
  locationName?: string;
  locationAddress?: string;
  location?: string;
}) {
  return card.locationName || card.locationAddress || card.location || "未记录地点";
}
