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
__author__ = 'Iván Arias León (ivan.ariasleon@telefonica.com)'


import pymongo

class Mongo:
    """
    Mongo Management Class
    """

    def __init__(self,  mongo_host, mongo_port, mongo_database, mongo_collection=u''):
        """
        constructor class
        :param mongo_host:  mongo hostname
        :param mongo_port: mongo port
        :param mongo_database: mongo current database
        :param mongo_collection: mongo current collection
        """
        self.host = mongo_host
        self.port = mongo_port
        self.database_name = mongo_database
        self.collection_name = mongo_collection

    def choice_database(self, name):
        """
        Access to another database
        :param name: database name
        """
        self.database_name = name

    def get_current_database(self):
        """
        get current database
        :return: string
        """
        return self.database_name

    def connect(self):
        """
        connect to mongo
        Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname
        """
        self.mongo_uri = "mongodb://%s:%s/%s" % (self.host, self.port, self.database_name)
        try:
            self.client = pymongo.MongoClient(self.mongo_uri)
            self.current_database = self.client.get_default_database()
            if self.collection_name != u'':
                self.current_collection = self.current_database[self.collection_name]
            else:
                return " WARN - the collection has not been selected..."
        except Exception, e:
             assert False, " ERROR - Connecting to MongoDB...\n %s " % (str(e))

    def choice_collection(self, name):
        """
        Access to another collection in the current database
        :param name: collection name
        """
        try:
            self.collection_name = name
            self.current_collection = self.current_database[name]
        except Exception, e:
            assert False, " ERROR - Accessing to collection %s in MongoDB...\n %s" % (name, str(e))

    def get_current_connection(self):
        """
        get current connection data (host, port, database. collection)
        :return: collection dict
        """
        return self.current_collection

    def insert_data(self, data):
        """
        Insert a new document in a collection
        :param data:
        """
        try:
            self.current_collection.insert(data)
        except Exception, e:
             assert False, " ERROR - Inserting data into %s in MongoDB...\n %s" % (str(self.current_collection), str(e))

    def update_data(self, data, query={}):
        """
        update a document in a collection using a query
        :param data:
        :param query:
        """
        try:
            self.current_collection.update(query, data)
        except Exception, e:
             assert False, " ERROR - Updating data in a collection %s in MongoDB...\n %s" % (self.current_collection, str(e))

    def find_data(self, query={}):
        """
        find a set of data in the current collection using a collection
        :param query:
        :return: cursor
        """
        try:
            return self.current_collection.find(query)
        except Exception, e:
            assert False, " ERROR - Searching data from a collection %s in MongoDB...\n %s" % (self.current_collection, str(e))

    def drop_collection(self):
        """
         drop the current collection
        """
        try:
            self.current_database.drop_collection(self.collection_name)
        except Exception, e:
            assert False, " ERROR - Deleting a collection %s in MongoDB...\n %s" % (self.current_collection, str(e))

    def drop_database(self):
        """
        remove the current database
        """
        try:
            self.client.drop_database(self.database_name)
        except Exception, e:
            assert False, " ERROR - Deleting a database %s in MongoDB...\n %s" % (self.current_collection, str(e))

    def disconnect(self):
        """
        disconnect to mongo
        """
        try:
            self.client.close()
        except Exception, e:
             assert False, " ERROR - Disconnecting to MongoDB...\n %s\n%s " % (self.current_collection, str(e))

