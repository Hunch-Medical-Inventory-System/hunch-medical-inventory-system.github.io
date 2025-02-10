// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


export const readDataFromTable = async (
  table,
  options = { itemsPerPage: 100, page: 1, keywords: "" }
) => {

  let data = [{}];

  try {
    let response = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      );

    data = response;

  } catch (error) {
    console.error(error);
  }

  return data;
};

export const readDeletableDataFromTable = async (
  table,
  options = { itemsPerPage: 100, page: 1, keywords: "" }
) => {

  let currentData = [{}];
  let deletedData = [{}];

  try {
    let currentResponse = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .eq("is_deleted", false)
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      );

    let deletedResponse = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .eq("is_deleted", true)
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      );

    currentData = currentResponse;
    deletedData = deletedResponse;

  } catch (error) {
    console.error(error);
  }

  return { currentData, deletedData };
};

export const readExpirableDataFromTable = async (
  table,
  options = { itemsPerPage: 100, page: 1, keywords: "" }
) => {

  let currentData = [{}]
  let deletedData = [{}]
  let expiredData = [{}]

  const nowUtc = new Date().toISOString();

  try {
    let currentResponse = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .is("user_id", null)
      .gte("expiry_date", new Date().toISOString())
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      );

    let deletedResponse = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .not("user_id", "is", null)
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      );

    let expiredResponse = await supabase
      .from(table)
      .select("*", { count: "exact" })
      .order("id", { ascending: true })
      .is("user_id", null)
      .lt("expiry_date", new Date().toISOString())
      .range(
        options.itemsPerPage * (options.page - 1),
        options.itemsPerPage * options.page - 1
      )

    currentData = currentResponse
    deletedData = deletedResponse
    expiredData = expiredResponse

  } catch (error) {
    console.error(error)
  }

  return { currentData, deletedData, expiredData }
};

/**
 * Reads a specific row from a Supabase table by its ID.
 * Uses supabaseClient
 *
 * @param {string} table - The name of the table to read from.
 * @param {number|string} id - The ID of the row to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the data object of the row, or an empty object if an error occurs.
 */
export const readRowFromTable = async (table, id) => {
  let data = {};

  try {
    let response = await supabase.from(table).select("*").eq("id", id);
    data = response.data[0];
  } catch (error) {
    console.error(error);
  }

  return data;
};


// Supabase write functions

/**
 * Saves a new item to the database.
 * Uses Python API that uses Supabase
 * Frontend server /api is a proxy to the Python API
 *
 * @param {string} table - The name of the table to save to.
 * @param {number|string} id - The ID of the item to save.
 * @param {object} newValue - The new data to save.
 * @returns {Promise<number>} - A promise that resolves to the HTTP status code of the response.
 */
export const editRowFromTable = async (table, id, newValue) => {

  const data = await fetch(`/api/${table}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newValue),
  });

  return data.ok
};

/**
 * Creates a new item in the database.
 * Uses Python API that uses Supabase
 * Frontend server /api is a proxy to the Python API
 *
 * @param {string} table - The name of the table to create in.
 * @param {object} newValue - The new data to create.
 * @returns {Promise<number>} - A promise that resolves to the HTTP status code of the response.
 */
export const createRowFromTable = async (table, newValue) => {
  const data = await fetch(`/api/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newValue),
  });

  return data.ok
};

/**
 * Deletes an item from the database by its ID.
 * Uses Python API that uses Supabase
 * Frontend server /api is a proxy to the Python API
 *
 * @param {string} table - The name of the table to delete from.
 * @param {number|string} id - The ID of the item to delete.
 * @returns {Promise<number>} - A promise that resolves to the HTTP status code of the response.
 */
export const deleteRowFromTable = async (table, id) => {
  const data = await fetch(`/api/${table}/${id}`, {
    method: "DELETE",
  });

  return data.ok
};
