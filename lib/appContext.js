/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of perseo-fe
 *
 * perseo-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * perseo-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with perseo-fe.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */
'use strict';

var database, orionDatabase;

function SetDB(db) {
    database = db;
}

function DB() {
    return database;
}
function SetOrionDB(db) {
    orionDatabase = db;
}

function OrionDB(database) {
    return orionDatabase.db(database);
}

/**
 * SetDB saves a mongodb connection object in the application context
 *
 * @param {Object}        db connection
 */
module.exports.SetDB = SetDB;

/**
 * database returns the mongodb connection object saved in the application context
 *
 * @return {Object}        db connection
 */
module.exports.Db = DB;
/**
 * SetDB saves a mongodb connection object in the application context
 *
 * @param {Object}        db connection
 */
module.exports.SetOrionDB = SetOrionDB;

/**
 * database returns the mongodb connection object saved in the application context
 *
 * @return {Object}        db connection
 */
module.exports.OrionDb = OrionDB;
