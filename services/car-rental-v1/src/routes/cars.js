import { Router } from "express";
import { getCars, getFilterList } from "../services/dataHandler";
import TagNotFoundError from "../errors/TagNotFoundError";

const router = Router();

const stringToArray = (s) => s && s.split(",");

/**
 * GET /api/v1/cars/info/{filter}
 * @tag Car Rental
 * @summary Get filter list
 * @description Gets list of a type to filter Car Rental data by.
 * @pathParam {FilterType} filter - The name of the filter to get options for.
 * @response 200 - OK
 * @response 400 - Filter Not Found Error
 * @response 500 - Internal Server Error
 */
router.get("/info/:tag", async (req, res, next) => {
  const { tag } = req.params;
  try {
    const data = await getFilterList(tag);
    res.json(data);
  } catch (e) {
    if (e instanceof TagNotFoundError) {
      return res.status(400).json({ error: e.message });
    }
    next(e);
  }
});

/**
 * GET /api/v1/cars/{country}/{city}
 * @tag Car Rental
 * @summary Get list of cars
 * @description Gets data associated with a specific city.
 * @pathParam {string} country - Country of the rental company using slug casing.
 * @pathParam {string} city - City of the rental company using slug casing.
 * @queryParam {string} [company] - Rental Company name.
 * @queryParam {string} [car] - Car Name.
 * @queryParam {string} [type] - Car Type.
 * @queryParam {string} [style] - Car Style.
 * @queryParam {number} [mincost] - Min Cost.
 * @queryParam {number} [maxcost] - Max Cost.
 * @response 200 - OK
 * @response 500 - Internal Server Error
 */
// TODO: throw 2 400 errors for CountryNotFound and CityNotFound for country X.
router.get("/:country/:city", async (req, res, next) => {
  const { country, city } = req.params;
  const { company, car, type, style, mincost, maxcost } = req.query;

  try {
    const data = await getCars(country, city, {
      company: stringToArray(company),
      car: stringToArray(car),
      type: stringToArray(type),
      style: stringToArray(style),
      minCost: parseInt(mincost, 10) || undefined,
      maxCost: parseInt(maxcost, 10) || undefined,
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default router;
