export interface ParkingZoneRow {
  id: number;
  name: string;
  address: string;
  hourly_cost: number;
  created_at: Date;
  updated_at: Date;
}

export interface ParkingZone {
  id: number;
  name: string;
  address: string;
  hourlyCost: number;
  createdAt: Date;
  updatedAt: Date;
}
