# -*- coding: utf-8 -*-
#
# Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of perseo-fe
#
# perseo-fe is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# perseo-fe is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with perseo-fe.
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with:
#   iot_support at tid.es
#



from lettuce import world
import pymongo

class Mongo:
    client     = None
    db         = None
    host       = None
    port       = None
    database   = None


    def __init__(self,  mongo_host, mongo_port, mongo_database, mongo_collection):
        global host, port, database, collection
        host = mongo_host
        port = mongo_port
        database = mongo_database
        world.collection = mongo_collection

    def connect(self):
        """
        connect to mongo db
        :param mongo_uri: Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
        """
        global client, db
        mongo_uri = "mongodb://%s:%s/%s" % (host, port, database)
        try:
            client = pymongo.MongoClient(mongo_uri)
            db = client.get_default_database()
        except Exception, e:
             print " ERROR - Connecting to MongoDB...\n %s " % (str(e))

    def current_collection(self, name):
        """
        Access to a collection in a db
        :param db: db used
        :param name: collection name
        """
        global db
        try:
            return db[name]
        except Exception, e:
            print " ERROR - Accessing to collection %s in MongoDB...\n %s" % (name, str(e))

    def insert_data (self,collection, data):
        """
        Insert a new document in a collection
        """
        try:
            collection.insert(data)
        except Exception, e:
            print " ERROR - Inserting data into %s in MongoDB...\n %s" % (str(collection), str(e))

    def update_data (self,collection, query, data):
        """
        update a document in a collection
        """
        try:
            collection.update(query, data)
        except Exception, e:
            print " ERROR - Updating data in a collection %s in MongoDB...\n %s" % (collection, str(e))

    def find_data (self, collection, query):
        """
        find a set of data in a collection
        :return: cursor
        """
        try:
            return collection.find(query)
        except Exception, e:
            print " ERROR - Searching data from a collection %s in MongoDB...\n %s" % (collection, str(e))

    def drop_collection (self, collection):
        """
        remove a collection in mongo db
        :param db:
        :param collection:
        """
        global db
        try:
            db.drop_collection(collection)
        except Exception, e:
            print " ERROR - Deleting a collection %s in MongoDB...\n %s" % (collection, str(e))

    def disconnect (self):
        """
        disconnect to mongo db
        """
        global client
        try:
            client.close()
        except Exception, e:
             print " ERROR - Disconnecting to MongoDB...\n %s " % (str(e))

